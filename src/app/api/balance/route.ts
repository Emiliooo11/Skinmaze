import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, signSession } from '@/app/lib/session';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/balance  { delta: number }
// delta > 0 = credit, delta < 0 = debit
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sm_session')?.value;
  if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'invalid_session' }, { status: 401 });

  const { delta } = await request.json() as { delta: number };
  if (typeof delta !== 'number' || isNaN(delta)) {
    return NextResponse.json({ error: 'invalid_delta' }, { status: 400 });
  }

  // Fetch current balance from DB
  const { data: player, error: fetchErr } = await supabase
    .from('players')
    .select('balance')
    .eq('id', session.id)
    .single();

  if (fetchErr || !player) {
    return NextResponse.json({ error: 'player_not_found' }, { status: 404 });
  }

  const newBalance = +(player.balance + delta).toFixed(2);

  // Prevent going below zero
  if (newBalance < 0) {
    return NextResponse.json({ error: 'insufficient_balance', balance: player.balance }, { status: 402 });
  }

  const { error: updateErr } = await supabase
    .from('players')
    .update({ balance: newBalance })
    .eq('id', session.id);

  if (updateErr) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  // Refresh the session cookie with updated balance
  const newToken = signSession({ ...session, balance: newBalance });
  cookieStore.set('sm_session', newToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secure: true,
  });

  return NextResponse.json({ balance: newBalance });
}
