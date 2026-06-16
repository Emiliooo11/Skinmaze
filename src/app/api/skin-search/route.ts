import { NextRequest, NextResponse } from 'next/server';

const STEAM_IMG = (icon: string) =>
  `https://community.fastly.steamstatic.com/economy/image/${icon}`;

const COLOR_RAR: Record<string, { rar: string; color: string; label: string }> = {
  '4b69ff': { rar: 'blue',   color: '#4b69ff', label: 'Mil-Spec Grade' },
  '8847ff': { rar: 'purple', color: '#8847ff', label: 'Restricted' },
  'd32ce6': { rar: 'pink',   color: '#d32ce6', label: 'Classified' },
  'eb4b4b': { rar: 'red',    color: '#eb4b4b', label: 'Covert' },
  'e4ae39': { rar: 'gold',   color: '#e6c33e', label: 'Extraordinary' },
  'cf6a32': { rar: 'blue',   color: '#4b69ff', label: 'Mil-Spec Grade' },
};
const DEFAULT_RAR = { rar: 'blue', color: '#4b69ff', label: 'Mil-Spec Grade' };

// Category → Steam weapon tags (multiple tags = OR'd together)
const CATEGORY_TAGS: Record<string, string[]> = {
  Rifle:      ['weapon_ak47','weapon_m4a4','weapon_m4a1_silencer','weapon_sg556','weapon_aug','weapon_galilar','weapon_famas'],
  Pistol:     ['weapon_deagle','weapon_glock','weapon_usp_silencer','weapon_p250','weapon_fiveseven','weapon_tec9','weapon_cz75a','weapon_revolver','weapon_p2000','weapon_elite'],
  Sniper:     ['weapon_awp','weapon_ssg08','weapon_scar20','weapon_g3sg1'],
  SMG:        ['weapon_mp9','weapon_mac10','weapon_mp5sd','weapon_mp7','weapon_ump45','weapon_p90','weapon_bizon'],
  Shotgun:    ['weapon_nova','weapon_xm1014','weapon_mag7','weapon_sawedoff'],
  Machinegun: ['weapon_m249','weapon_negev'],
  Knifes:     ['weapon_knife','weapon_knife_butterfly','weapon_knife_karambit','weapon_knife_m9_bayonet','weapon_knife_flip','weapon_knife_gut','weapon_knife_tactical','weapon_knife_falchion','weapon_knife_survival_bowie','weapon_knife_push','weapon_knife_ursus','weapon_knife_gypsy_jackknife','weapon_knife_stiletto','weapon_knife_widowmaker'],
  Gloves:     ['weapon_hand_wrap'],
};

// Rarity → Steam tag
const RARITY_TAGS: Record<string, string> = {
  blue:   'tag_Rarity_Rare',
  purple: 'tag_Rarity_Mythical',
  pink:   'tag_Rarity_Legendary',
  red:    'tag_Rarity_Ancient',
};

function parseSkin(item: SteamItem) {
  const desc = item.asset_description;
  const nameColor = (desc.name_color || '').toLowerCase();
  const rarInfo = COLOR_RAR[nameColor] || DEFAULT_RAR;
  const typeParts = (desc.type || '').split(' ');
  const category = typeParts[typeParts.length - 1] || 'Other';
  const wearMatch = item.hash_name.match(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/);
  const wear = wearMatch?.[1] || '';
  const pipeIdx = item.hash_name.indexOf(' | ');
  const name = pipeIdx >= 0 ? item.hash_name.slice(0, pipeIdx) : item.hash_name;
  const skinWithWear = pipeIdx >= 0 ? item.hash_name.slice(pipeIdx + 3) : '';
  const skin = wear ? skinWithWear.replace(` (${wear})`, '') : skinWithWear;
  const isStatTrak = item.hash_name.startsWith('StatTrak™');
  const price = item.sell_price / 100;
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
}

const PAGE_SIZE = 48;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q        = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const rarity   = searchParams.get('rarity') || '';
  const count    = Math.min(parseInt(searchParams.get('count') || String(PAGE_SIZE)), 100);
  const start    = Math.max(0, parseInt(searchParams.get('start') || '0'));
  const sort     = searchParams.get('sort') || 'price_desc';
  const minPrice = parseFloat(searchParams.get('minPrice') || '0');   // USD
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');   // USD, 0 = no limit

  const [sortCol, sortDir] = sort === 'price_asc'
    ? ['price', 'asc']
    : sort === 'name'
      ? ['name', 'asc']
      : ['price', 'desc'];

  const hasPriceFilter = minPrice > 0 || maxPrice > 0;
  // Fetch a larger batch when price filtering so we have enough after filtering
  const fetchCount = hasPriceFilter ? Math.min(count * 4, 200) : count;

  const base = new URLSearchParams({
    appid: '730',
    norender: '1',
    count: String(fetchCount),
    start: String(hasPriceFilter ? 0 : start),
    sort_column: sortCol,
    sort_dir: sortDir,
  });

  if (q) base.set('query', q);

  // Weapon category tags
  const weaponTags = category && CATEGORY_TAGS[category] ? CATEGORY_TAGS[category] : [];
  for (const tag of weaponTags) {
    base.append('category_730_Weapon[]', `tag_${tag}`);
  }

  // Rarity tag
  if (rarity && RARITY_TAGS[rarity]) {
    base.append('category_730_Rarity[]', RARITY_TAGS[rarity]);
  }

  // When no query and no category, default to popular weapons (exclude souvenir/sticker noise)
  if (!q && !category) {
    for (const tag of [...CATEGORY_TAGS.Rifle, ...CATEGORY_TAGS.Pistol, ...CATEGORY_TAGS.Sniper]) {
      base.append('category_730_Weapon[]', `tag_${tag}`);
    }
  }

  try {
    const url = `https://steamcommunity.com/market/search/render/?${base}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Steam Market ${res.status}`);
    const json = await res.json();

    // Filter out items without a pipe (stickers, cases, keys, patches, etc.)
    let results = (json.results || [])
      .filter((item: SteamItem) => item.hash_name.includes(' | '))
      .map(parseSkin);

    // Apply price filter server-side (Steam's render endpoint ignores price params)
    if (minPrice > 0) results = results.filter((s: ReturnType<typeof parseSkin>) => s.price >= minPrice);
    if (maxPrice > 0) results = results.filter((s: ReturnType<typeof parseSkin>) => s.price <= maxPrice);

    // When price filtering, paginate the filtered results manually
    const total = hasPriceFilter ? results.length : (json.total_count ?? results.length);
    if (hasPriceFilter) results = results.slice(start, start + count);

    return NextResponse.json({ results, total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}

interface SteamItem {
  hash_name: string;
  sell_listings: number;
  sell_price: number;
  asset_description: {
    classid: string;
    icon_url: string;
    name_color: string;
    type: string;
  };
}
