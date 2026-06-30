import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sm_session')?.value;
  if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'invalid_session' }, { status: 401 });

  const { code } = await req.json();
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'code_required' }, { status: 400 });
  }

  const upper = code.toUpperCase().trim();

  // Look up the referral code
  const { data: rc } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('code', upper)
    .maybeSingle();

  if (!rc) return NextResponse.json({ error: 'invalid_code' }, { status: 404 });

  // Check expiry
  if (rc.expires_at && new Date(rc.expires_at) < new Date()) {
    return NextResponse.json({ error: 'code_expired' }, { status: 400 });
  }

  // Check max uses
  if (rc.max_uses !== null && rc.used_count >= rc.max_uses) {
    return NextResponse.json({ error: 'code_exhausted' }, { status: 400 });
  }

  // Check if player already claimed this code
  const { data: existing } = await supabase
    .from('referral_uses')
    .select('id')
    .eq('code_id', rc.id)
    .eq('player_id', session.id)
    .maybeSingle();

  if (existing) return NextResponse.json({ error: 'already_claimed' }, { status: 400 });

  // Record the use
  await supabase.from('referral_uses').insert({ code_id: rc.id, player_id: session.id, wager_amount: 0 });
  try { await supabase.rpc('increment_referral_used_count', { p_code_id: rc.id }); } catch {}

  // Disburse reward
  let reward: { type: string; value: number } | null = null;
  if (rc.reward_type && rc.reward_value > 0) {
    if (rc.reward_type === 'coins' || rc.reward_type === 'free_cases') {
      const { data: p } = await supabase.from('players').select('balance').eq('id', session.id).single();
      if (p) {
        await supabase.from('players').update({ balance: (p.balance || 0) + rc.reward_value }).eq('id', session.id);
      }
      reward = { type: rc.reward_type, value: rc.reward_value };
    } else if (rc.reward_type === 'deposit_bonus') {
      reward = { type: 'deposit_bonus', value: rc.reward_value };
    }
  }

  return NextResponse.json({ success: true, reward });
}
