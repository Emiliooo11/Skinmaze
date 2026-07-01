import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: NextRequest) {
  const { dataUrl, filename } = await req.json() as { dataUrl: string; filename: string };
  if (!dataUrl?.startsWith('data:')) {
    return NextResponse.json({ error: 'invalid dataUrl' }, { status: 400 });
  }

  const [header, base64] = dataUrl.split(',');
  const contentType = header.match(/data:([^;]+)/)?.[1] ?? 'image/png';
  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png';
  const buf = Buffer.from(base64, 'base64');

  // Stable path from filename + size so re-uploads don't duplicate
  const slug = Buffer.from(`${filename}-${buf.length}`).toString('base64url').slice(0, 40);
  const path = `uploads/${slug}.${ext}`;

  const { error } = await supabase.storage.from('images').upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.error('upload-image error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
