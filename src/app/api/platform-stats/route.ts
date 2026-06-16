import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const since5min = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const [
    { count: totalPlayers },
    { count: onlinePlayers },
    { count: casesOpened },
  ] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }).gte('last_active', since5min),
    supabase.from('wagers').select('*', { count: 'exact', head: true }),
  ]);

  return NextResponse.json({
    totalPlayers: totalPlayers ?? 0,
    onlinePlayers: onlinePlayers ?? 0,
    casesOpened:  casesOpened  ?? 0,
  });
}
