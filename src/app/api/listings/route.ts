import { NextRequest, NextResponse } from 'next/server';
import { normalizeListing, CSFloatListing } from '@/app/lib/csfloat';

const BASE = 'https://csfloat.com/api/v1';

export async function GET(req: NextRequest) {
  const key = process.env.CSFLOAT_API_KEY;
  if (!key) return NextResponse.json({ error: 'No API key configured' }, { status: 500 });

  const { searchParams } = req.nextUrl;
  const params = new URLSearchParams({
    limit: searchParams.get('limit') || '24',
    type: searchParams.get('type') || 'buy_now',
    ...(searchParams.get('category') ? { category: searchParams.get('category')! } : {}),
    ...(searchParams.get('min_price') ? { min_price: searchParams.get('min_price')! } : {}),
    ...(searchParams.get('max_price') ? { max_price: searchParams.get('max_price')! } : {}),
    ...(searchParams.get('market_hash_name') ? { market_hash_name: searchParams.get('market_hash_name')! } : {}),
    ...(searchParams.get('sort_by') ? { sort_by: searchParams.get('sort_by')! } : {}),
    ...(searchParams.get('rarity') ? { rarity: searchParams.get('rarity')! } : {}),
  });

  try {
    const res = await fetch(`${BASE}/listings?${params}`, {
      headers: { Authorization: key },
      next: { revalidate: 60 }, // cache 60s
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }
    const json = await res.json();
    const normalized = (json.data as CSFloatListing[]).map(normalizeListing);
    return NextResponse.json({ data: normalized, count: json.count });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
