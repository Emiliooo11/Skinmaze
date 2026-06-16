import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data } = await supabase
    .from('wagers')
    .select('id,won_item,won_item_image,won_item_color,won_value,player_name,player_avatar,case_name,created_at')
    .not('won_item', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase.from('wagers').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
