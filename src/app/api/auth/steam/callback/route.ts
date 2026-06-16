import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { signSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://skinmaze.gg';

  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    // 1. Verify with Steam
    const verifyParams = new URLSearchParams({ ...params, 'openid.mode': 'check_authentication' });
    const verifyRes = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    });
    const verifyText = await verifyRes.text();
    if (!verifyText.includes('is_valid:true')) {
      return NextResponse.redirect(`${baseUrl}/?error=steam_auth_failed`);
    }

    // 2. Extract Steam ID
    const claimedId = params['openid.claimed_id'] || '';
    const steamId = claimedId.match(/\/id\/(\d+)$/)?.[1];
    if (!steamId) {
      return NextResponse.redirect(`${baseUrl}/?error=no_steam_id`);
    }

    // 3. Fetch Steam profile (non-blocking — fall back gracefully)
    let steamPlayer: { personaname?: string; avatarfull?: string } | null = null;
    try {
      const profileRes = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const profileJson = await profileRes.json();
      steamPlayer = profileJson?.response?.players?.[0] ?? null;
    } catch (e) {
      console.warn('Steam profile fetch failed, continuing without it:', e);
    }

    // 4. Get pending registration data
    const cookieStore = await cookies();
    const pending = JSON.parse(cookieStore.get('steam_pending')?.value || '{}');

    // 5. Find or create player
    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .eq('steam_id', steamId)
      .maybeSingle();

    let player = existing;

    if (!existing) {
      const { data: created, error: insertError } = await supabase
        .from('players')
        .insert({
          id: crypto.randomUUID(),
          steam_id: steamId,
          username: steamPlayer?.personaname || pending.name || 'Player',
          email: pending.email || null,
          balance: 0.50,
          total_wagered: 0,
          cases_opened: 0,
          status: 'active',
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(insertError.code + ': ' + insertError.message)}`);
      }
      player = created;
    } else {
      await supabase
        .from('players')
        .update({ last_active: new Date().toISOString() })
        .eq('steam_id', steamId);
    }

    if (!player) {
      return NextResponse.redirect(`${baseUrl}/?error=player_null`);
    }

    // 6. Set session cookie
    const sessionToken = signSession({
      id: player.id,
      steamId,
      username: player.username,
      avatar: steamPlayer?.avatarfull || null,
      email: player.email,
      balance: player.balance,
    });

    cookieStore.set('sm_session', sessionToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
    cookieStore.delete('steam_pending');

    return NextResponse.redirect(`${baseUrl}/cases`);

  } catch (err) {
    console.error('Steam callback unhandled error:', err);
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(msg)}`);
  }
}
