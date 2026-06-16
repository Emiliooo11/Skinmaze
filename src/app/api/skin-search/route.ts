import { NextRequest, NextResponse } from 'next/server';

const STEAM_IMG = (icon: string) =>
  `https://community.fastly.steamstatic.com/economy/image/${icon}`;

// Map Steam name_color hex → our rarity label + color
const COLOR_RAR: Record<string, { rar: string; color: string; label: string }> = {
  '4b69ff': { rar: 'blue',   color: '#4b69ff', label: 'Mil-Spec Grade' },
  '8847ff': { rar: 'purple', color: '#8847ff', label: 'Restricted' },
  'd32ce6': { rar: 'pink',   color: '#d32ce6', label: 'Classified' },
  'eb4b4b': { rar: 'red',    color: '#eb4b4b', label: 'Covert' },
  'e4ae39': { rar: 'gold',   color: '#e6c33e', label: 'Extraordinary' },
  'cf6a32': { rar: 'blue',   color: '#4b69ff', label: 'Mil-Spec Grade' }, // StatTrak orange → treat as same item
};
const DEFAULT_RAR = { rar: 'blue', color: '#4b69ff', label: 'Mil-Spec Grade' };

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || '';
  const count = Math.min(parseInt(req.nextUrl.searchParams.get('count') || '24'), 50);
  if (!query.trim()) return NextResponse.json({ results: [] });

  try {
    const qs = new URLSearchParams({
      query,
      appid: '730',
      norender: '1',
      count: String(count),
      sort_column: 'price',
      sort_dir: 'desc',
    });

    const res = await fetch(
      `https://steamcommunity.com/market/search/render/?${qs}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`Steam Market ${res.status}`);
    const json = await res.json();

    const results = (json.results || []).map((item: SteamMarketResult) => {
      const desc = item.asset_description;
      const nameColor = (desc.name_color || '').toLowerCase();
      const rarInfo = COLOR_RAR[nameColor] || DEFAULT_RAR;

      // Parse "Classified Rifle" → category
      const typeParts = (desc.type || '').split(' ');
      const category = typeParts[typeParts.length - 1] || 'Other';

      // Extract wear from hash_name
      const wearMatch = item.hash_name.match(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/);
      const wear = wearMatch?.[1] || '';

      // Parse "AK-47 | Redline (Field-Tested)" → name + skin
      const pipeIdx = item.hash_name.indexOf(' | ');
      const name = pipeIdx >= 0 ? item.hash_name.slice(0, pipeIdx) : item.hash_name;
      const skinWithWear = pipeIdx >= 0 ? item.hash_name.slice(pipeIdx + 3) : '';
      const skin = wear ? skinWithWear.replace(` (${wear})`, '') : skinWithWear;

      const isStatTrak = item.hash_name.startsWith('StatTrak™');
      const price = item.sell_price / 100; // cents → dollars

      return {
        id: desc.classid,
        name,
        skin,
        fullName: item.hash_name,
        wear,
        category,
        rar: rarInfo.rar,
        color: rarInfo.color,
        rarityName: rarInfo.label,
        price,
        priceDisplay: price.toFixed(2),
        imageUrl: desc.icon_url ? STEAM_IMG(desc.icon_url) : '',
        isStatTrak,
        listings: item.sell_listings,
      };
    });

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}

interface SteamMarketResult {
  name: string;
  hash_name: string;
  sell_listings: number;
  sell_price: number;
  sell_price_text: string;
  asset_description: {
    classid: string;
    icon_url: string;
    name_color: string;
    type: string;
    market_hash_name: string;
  };
}
