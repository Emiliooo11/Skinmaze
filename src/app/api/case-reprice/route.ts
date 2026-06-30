import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(req: NextRequest) {
  const { id, price } = await req.json();
  if (!id || typeof price !== 'number') {
    return NextResponse.json({ error: 'id and price required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('cases')
    .update({ price })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id, price });
}
