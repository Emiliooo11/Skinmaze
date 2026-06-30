import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Fetch current Steam Market price for a single skin by market_hash_name
async function fetchSteamPrice(marketHashName: string): Promise<number | null> {
  try {
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(marketHashName)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.lowest_price) return null;
    // lowest_price is e.g. "$14.32" — strip non-numeric except dot
    const price = parseFloat(json.lowest_price.replace(/[^0-9.]/g, ''));
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

export interface CaseHealthRow {
  id: string;
  name: string;
  storedPrice: number;
  storedHouseEdge: number;
  currentEv: number;
  suggestedPrice: number;
  currentHouseEdge: number;        // derived from stored price vs current EV
  drift: number;                   // % change in EV vs stored EV at build time
  status: 'ok' | 'warning' | 'critical';
  skinsChecked: number;
  skinsFailed: number;
}

export async function GET() {
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*, skins:case_skins(market_name, price, drop_chance)')
    .order('created_at', { ascending: false });

  if (error || !cases) {
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }

  const results: CaseHealthRow[] = [];

  for (const c of cases) {
    const skins: Array<{ market_name: string; price: number; drop_chance: number }> = c.skins ?? [];
    if (!skins.length) continue;

    let currentEv = 0;
    let skinsChecked = 0;
    let skinsFailed = 0;

    // Fetch current prices — run in parallel, max 5 at a time to avoid rate-limiting
    const chunks: typeof skins[] = [];
    for (let i = 0; i < skins.length; i += 5) chunks.push(skins.slice(i, i + 5));

    for (const chunk of chunks) {
      const prices = await Promise.all(chunk.map(s => fetchSteamPrice(s.market_name)));
      for (let i = 0; i < chunk.length; i++) {
        const currentPrice = prices[i];
        if (currentPrice === null) { skinsFailed++; currentEv += chunk[i].price * (chunk[i].drop_chance / 100); }
        else { skinsChecked++; currentEv += currentPrice * (chunk[i].drop_chance / 100); }
      }
    }

    const storedPrice = c.price as number;
    const storedHouseEdge = c.house_edge as number;
    const suggestedPrice = storedHouseEdge < 100 ? currentEv / (1 - storedHouseEdge / 100) : currentEv;
    const currentHouseEdge = storedPrice > 0 ? (1 - currentEv / storedPrice) * 100 : 0;

    // Drift = how much suggested price changed vs stored price, as %
    const drift = storedPrice > 0 ? ((suggestedPrice - storedPrice) / storedPrice) * 100 : 0;

    const status: CaseHealthRow['status'] =
      currentHouseEdge < 0 ? 'critical' :        // losing money on every open
      currentHouseEdge < storedHouseEdge * 0.5 ? 'warning' :  // edge halved
      'ok';

    results.push({
      id: c.id, name: c.name,
      storedPrice, storedHouseEdge,
      currentEv: +currentEv.toFixed(4),
      suggestedPrice: +suggestedPrice.toFixed(2),
      currentHouseEdge: +currentHouseEdge.toFixed(2),
      drift: +drift.toFixed(2),
      status, skinsChecked, skinsFailed,
    });
  }

  return NextResponse.json({ results, checkedAt: new Date().toISOString() });
}
