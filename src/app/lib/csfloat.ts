// CSFloat API client — all calls go through Next.js API routes to keep the key server-side

export const STEAM_IMG = (iconUrl: string) =>
  `https://community.fastly.steamstatic.com/economy/image/${iconUrl}`;

// Rarity mapping: CSFloat int → our Rarity type
const RARITY_MAP: Record<number, string> = {
  1: 'blue',   // Consumer
  2: 'blue',   // Industrial
  3: 'blue',   // Mil-Spec
  4: 'purple', // Restricted
  5: 'pink',   // Classified
  6: 'red',    // Covert
  7: 'gold',   // Contraband / Extraordinary
};

const RARITY_COLOR: Record<string, string> = {
  blue: '#4b69ff', purple: '#8847ff', pink: '#d32ee6', red: '#eb4b4b', gold: '#e6c33e',
};

export interface CSFloatListing {
  id: string;
  price: number; // cents
  item: {
    asset_id: string;
    market_hash_name: string;
    icon_url: string;
    float_value: number;
    rarity: number;
    rarity_name: string;
    wear_name: string;
    is_stattrak: boolean;
    is_souvenir: boolean;
    item_name: string;
    phase?: string;
    collection?: string;
    stickers?: Array<{ name: string; icon_url: string; slot: number }>;
  };
  reference: {
    base_price: number;
    predicted_price: number;
  };
  seller: {
    username?: string;
    avatar?: string;
    steam_id?: string;
  };
}

export interface NormalizedSkin {
  id: string;
  assetId: string;
  name: string;       // e.g. "AK-47"
  skin: string;       // e.g. "Redline"
  fullName: string;   // market_hash_name
  wear: string;
  float: number | null;
  rarity: string;     // our rarity key
  rarityName: string;
  color: string;
  price: number;      // USD
  priceDisplay: string;
  imageUrl: string;
  isStatTrak: boolean;
  isSouvenir: boolean;
  phase?: string;
  collection?: string;
  stickers: Array<{ name: string; iconUrl: string; slot: number }>;
}

export function normalizeListing(l: CSFloatListing): NormalizedSkin {
  const item = l.item;
  const rar = RARITY_MAP[item.rarity] || 'blue';

  // Split "AK-47 | Redline" → name + skin
  const pipeIdx = item.item_name.indexOf(' | ');
  const name = pipeIdx >= 0 ? item.item_name.slice(0, pipeIdx) : item.item_name;
  const skin = pipeIdx >= 0 ? item.item_name.slice(pipeIdx + 3) : '';

  const priceUsd = l.price / 100;

  return {
    id: l.id,
    assetId: item.asset_id,
    name,
    skin,
    fullName: item.market_hash_name,
    wear: item.wear_name,
    float: item.float_value ?? null,
    rarity: rar,
    rarityName: item.rarity_name,
    color: RARITY_COLOR[rar] || '#4b69ff',
    price: priceUsd,
    priceDisplay: priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    imageUrl: STEAM_IMG(item.icon_url),
    isStatTrak: item.is_stattrak,
    isSouvenir: item.is_souvenir,
    phase: item.phase,
    collection: item.collection,
    stickers: (item.stickers || []).map(s => ({ name: s.name, iconUrl: s.icon_url, slot: s.slot })),
  };
}
