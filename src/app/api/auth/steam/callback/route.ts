import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { signSession } from '@/app/lib/session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://skinmaze.gg';
  const params = Object.fromEntries(url.searchParams);

  // Verify with Steam
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

  // Extract Steam ID
  const claimedId = params['openid.claimed_id'] || '';
  const steamId = claimedId.match(/\/id\/(\d+)$/)?.[1];
  if (!steamId) {
    return NextResponse.redirect(`${baseUrl}/?error=no_steam_id`);
  }

  // Fetch Steam profile
  let steamPlayer: { personaname?: string; avatarfull?: string } | null = null;
  try {
    const profileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    );
    const profileJson = await profileRes.json();
    steamPlayer = profileJson.response?.players?.[0] ?? null;
  } catch {}

  // Get pending registration data
  const cookieStore = await cookies();
  const pending = JSON.parse(cookieStore.get('steam_pending')?.value || '{}');

  // Try to find existing player by steam_id
  const { data: existing, error: findError } = await supabase
    .from('players')
    .select('*')
    .eq('steam_id', steamId)
    .maybeSingle();

  let player = existing;

  if (!existing) {
    // Create new player
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
      console.error('Player insert error:', insertError);
      return NextResponse.redirect(
        `${baseUrl}/?error=${encodeURIComponent(insertError.message)}`
      );
    }
    player = created;
  } else {
    // Update last_active
    const { data: updated } = await supabase
      .from('players')
      .update({ last_active: new Date().toISOString() })
      .eq('steam_id', steamId)
      .select()
      .single();
    player = updated || existing;
  }

  if (!player) {
    return NextResponse.redirect(`${baseUrl}/?error=player_null`);
  }

  // Set signed session cookie
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
    secure: process.env.NODE_ENV === 'production',
  });
  cookieStore.delete('steam_pending');

  return NextResponse.redirect(`${baseUrl}/cases`);
}
