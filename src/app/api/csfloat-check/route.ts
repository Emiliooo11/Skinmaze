import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://csfloat.com/api/v1';
const WITHDRAWAL_FEE_PCT = 5; // platform withdrawal fee %

export async function GET(req: NextRequest) {
  const key = process.env.CSFLOAT_API_KEY;
  if (!key) return NextResponse.json({ error: 'No API key' }, { status: 500 });

  const name = req.nextUrl.searchParams.get('market_hash_name');
  if (!name) return NextResponse.json({ error: 'market_hash_name required' }, { status: 400 });

  try {
    const params = new URLSearchParams({
      market_hash_name: name,
      type: 'buy_now',
      limit: '5',
      sort_by: 'lowest_price',
    });
    const res = await fetch(`${BASE}/listings?${params}`, {
      headers: { Authorization: key },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ available: false, error: text });
    }

    const json = await res.json();
    const listings: Array<{ id: string; price: number }> = json.data ?? [];

    if (!listings.length) {
      return NextResponse.json({ available: false, feePct: WITHDRAWAL_FEE_PCT });
    }

    const cheapest = listings[0];
    const priceUsd = cheapest.price / 100;
    const feeUsd = +(priceUsd * (WITHDRAWAL_FEE_PCT / 100)).toFixed(2);
    const totalUsd = +(priceUsd + feeUsd).toFixed(2);

    return NextResponse.json({
      available: true,
      listingId: cheapest.id,
      priceUsd,
      feeUsd,
      feePct: WITHDRAWAL_FEE_PCT,
      totalUsd,
      stockCount: listings.length,
    });
  } catch (e) {
    return NextResponse.json({ available: false, error: String(e) });
  }
}
