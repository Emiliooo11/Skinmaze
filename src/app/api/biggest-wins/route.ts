import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const now = new Date();
  const startOfDay  = new Date(now); startOfDay.setHours(0,0,0,0);
  const t7d  = new Date(now.getTime() - 7  * 86400 * 1000);
  const t30d = new Date(now.getTime() - 30 * 86400 * 1000);

  const pick = (rows: any[]) => rows?.[0] ?? null;

  const [daily, weekly, monthly] = await Promise.all([
    supabase.from('wagers')
      .select('won_value,won_item,won_item_image,won_item_color,player_name,player_avatar')
      .gte('created_at', startOfDay.toISOString())
      .order('won_value', { ascending: false })
      .limit(1)
      .then(r => pick(r.data ?? [])),
    supabase.from('wagers')
      .select('won_value,won_item,won_item_image,won_item_color,player_name,player_avatar')
      .gte('created_at', t7d.toISOString())
      .order('won_value', { ascending: false })
      .limit(1)
      .then(r => pick(r.data ?? [])),
    supabase.from('wagers')
      .select('won_value,won_item,won_item_image,won_item_color,player_name,player_avatar')
      .gte('created_at', t30d.toISOString())
      .order('won_value', { ascending: false })
      .limit(1)
      .then(r => pick(r.data ?? [])),
  ]);

  return NextResponse.json({ daily, weekly, monthly });
}
