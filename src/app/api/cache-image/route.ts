import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Stable fingerprint from URL so we don't re-upload the same image
function urlToPath(url: string): string {
  const hash = Buffer.from(url).toString('base64url').slice(0, 48);
  const ext = url.match(/\.(png|jpg|jpeg|webp|gif)/i)?.[1] ?? 'png';
  return `${hash}.${ext}`;
}

export async function POST(req: NextRequest) {
  const { url } = await req.json() as { url: string };
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  // If it's already a Supabase storage URL or local path, return as-is
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (url.startsWith(supabaseUrl) || url.startsWith('/') || url.startsWith('data:')) {
    return NextResponse.json({ url });
  }

  const path = urlToPath(url);

  // Check if already cached
  const { data: existing } = supabase.storage.from('images').getPublicUrl(path);
  // Verify it actually exists by checking if stored
  const { data: list } = await supabase.storage.from('images').list('', { search: path });
  if (list && list.some(f => f.name === path)) {
    return NextResponse.json({ url: existing.publicUrl });
  }

  // Fetch the image
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) return NextResponse.json({ url }); // fallback to original on failure
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/png';

  // Upload to Supabase Storage
  const { error } = await supabase.storage.from('images').upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.error('Storage upload error:', error);
    return NextResponse.json({ url }); // fallback
  }

  const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
