import { NextRequest, NextResponse } from 'next/server';
import { STEAM_IMG } from '@/app/lib/csfloat';

export async function GET(req: NextRequest) {
  const key = process.env.CSFLOAT_API_KEY;
  const name = req.nextUrl.searchParams.get('name');
  if (!key || !name) return NextResponse.json({ error: 'missing params' }, { status: 400 });

  const params = new URLSearchParams({ market_hash_name: name, limit: '1', type: 'buy_now' });
  try {
    const res = await fetch(`https://csfloat.com/api/v1/listings?${params}`, {
      headers: { Authorization: key },
      next: { revalidate: 86400 }, // images don't change — cache 24h
    });
    const json = await res.json();
    const iconUrl = json.data?.[0]?.item?.icon_url;
    if (!iconUrl) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ imageUrl: STEAM_IMG(iconUrl) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
