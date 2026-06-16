import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sm_session')?.value;
  if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'invalid_session' }, { status: 401 });

  const { data: wagers } = await supabase
    .from('wagers')
    .select('*')
    .eq('player_id', session.id)
    .order('created_at', { ascending: false })
    .limit(200);

  const rows = wagers ?? [];

  const totalWin     = rows.reduce((s, w) => s + (w.won_value ?? 0), 0);
  const totalWagered = rows.reduce((s, w) => s + (w.amount ?? 0), 0);
  const casesOpened  = rows.length;

  // Most opened case
  const caseCount: Record<string, number> = {};
  for (const w of rows) {
    if (w.case_name) caseCount[w.case_name] = (caseCount[w.case_name] ?? 0) + 1;
  }
  const favoriteCase = Object.entries(caseCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return NextResponse.json({ totalWin, totalWagered, casesOpened, favoriteCase, transactions: rows });
}
