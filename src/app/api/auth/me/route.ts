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
  if (!token) return NextResponse.json(null);
  const session = verifySession(token);
  if (!session) return NextResponse.json(null);

  // Always fetch live balance from DB so out-of-band deposits/wins are reflected
  const { data } = await supabase
    .from('players')
    .select('balance')
    .eq('id', session.id)
    .single();

  return NextResponse.json({ ...session, balance: data?.balance ?? session.balance });
}
