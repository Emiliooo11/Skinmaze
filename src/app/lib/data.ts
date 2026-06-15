export type Rarity = 'blue' | 'purple' | 'pink' | 'red' | 'gold';
export type Category = 'Knifes' | 'Pistol' | 'Rifle' | 'Sniper' | 'SMG' | 'Shotgun' | 'Machinegun' | 'Gloves';

export interface SkinItem {
  id: number;
  w: string;
  skin: string;
  rar: Rarity;
  cat: Category;
  color: string;
  exterior: string;
  stat: boolean;
  price: string;
  ktype: string | null;
}

export interface ReelItem {
  w: string;
  skin: string;
  rar: Rarity;
  color: string;
  price: string;
  marketName: string;
}

export interface CaseItem {
  id: number;
  name: string;
  price: string;
  image: string;
}

// 6 real case images in /public/cases/ — cycled across all 30 case slots
export const CASE_IMAGES = [
  '/cases/case-water-camo.png',
  '/cases/case-gold-tiger.png',
  '/cases/case-prism.png',
  '/cases/case-hardened.png',
  '/cases/case-emerald.png',
  '/cases/case-jungle.png',
] as const;

export const RAR: Record<Rarity, { c: string; n: string }> = {
  blue:   { c: '#4b69ff', n: 'Mil-Spec' },
  purple: { c: '#8847ff', n: 'Restricted' },
  pink:   { c: '#d32ee6', n: 'Classified' },
  red:    { c: '#eb4b4b', n: 'Covert' },
  gold:   { c: '#e6c33e', n: 'Exceedingly Rare' },
};

export const POOL: Array<{ w: string; skin: string; rar: Rarity; cat: Category; marketName: string }> = [
  { w: 'AWP',                  skin: 'Dragon Lore',      rar: 'gold',   cat: 'Sniper',     marketName: 'AWP | Dragon Lore (Factory New)' },
  { w: '★ Karambit',          skin: 'Fade',             rar: 'gold',   cat: 'Knifes',     marketName: '★ Karambit | Fade (Factory New)' },
  { w: '★ Butterfly Knife',   skin: 'Slaughter',        rar: 'gold',   cat: 'Knifes',     marketName: '★ Butterfly Knife | Slaughter (Factory New)' },
  { w: '★ Bayonet',           skin: 'Doppler',          rar: 'gold',   cat: 'Knifes',     marketName: '★ Bayonet | Doppler (Factory New)' },
  { w: '★ Sport Gloves',      skin: "Pandora's Box",    rar: 'gold',   cat: 'Gloves',     marketName: "★ Sport Gloves | Pandora's Box (Field-Tested)" },
  { w: 'M4A4',                skin: 'Howl',             rar: 'red',    cat: 'Rifle',      marketName: 'M4A4 | Howl (Field-Tested)' },
  { w: 'AWP',                  skin: 'Asiimov',          rar: 'red',    cat: 'Sniper',     marketName: 'AWP | Asiimov (Field-Tested)' },
  { w: 'Desert Eagle',         skin: 'Blaze',            rar: 'red',    cat: 'Pistol',     marketName: 'Desert Eagle | Blaze (Factory New)' },
  { w: 'USP-S',               skin: 'Kill Confirmed',   rar: 'red',    cat: 'Pistol',     marketName: 'USP-S | Kill Confirmed (Field-Tested)' },
  { w: '★ Specialist Gloves', skin: 'Crimson Kimono',   rar: 'red',    cat: 'Gloves',     marketName: '★ Specialist Gloves | Crimson Kimono (Well-Worn)' },
  { w: 'AK-47',               skin: 'Vulcan',           rar: 'pink',   cat: 'Rifle',      marketName: 'AK-47 | Vulcan (Field-Tested)' },
  { w: 'M4A1-S',              skin: 'Hyper Beast',      rar: 'pink',   cat: 'Rifle',      marketName: 'M4A1-S | Hyper Beast (Field-Tested)' },
  { w: 'AWP',                  skin: 'Hyper Beast',      rar: 'pink',   cat: 'Sniper',     marketName: 'AWP | Hyper Beast (Field-Tested)' },
  { w: '★ Driver Gloves',     skin: 'King Snake',       rar: 'pink',   cat: 'Gloves',     marketName: '★ Driver Gloves | King Snake (Field-Tested)' },
  { w: 'AK-47',               skin: 'Redline',          rar: 'pink',   cat: 'Rifle',      marketName: 'AK-47 | Redline (Field-Tested)' },
  { w: 'AK-47',               skin: 'Slate',            rar: 'purple', cat: 'Rifle',      marketName: 'AK-47 | Slate (Factory New)' },
  { w: 'Glock-18',            skin: 'Water Elemental',  rar: 'purple', cat: 'Pistol',     marketName: 'Glock-18 | Water Elemental (Field-Tested)' },
  { w: 'P250',                skin: 'Asiimov',          rar: 'purple', cat: 'Pistol',     marketName: 'P250 | Asiimov (Field-Tested)' },
  { w: 'MP9',                 skin: 'Rose Iron',        rar: 'purple', cat: 'SMG',        marketName: 'MP9 | Rose Iron (Factory New)' },
  { w: 'MAC-10',              skin: 'Neon Rider',       rar: 'purple', cat: 'SMG',        marketName: 'MAC-10 | Neon Rider (Field-Tested)' },
  { w: 'Five-SeveN',          skin: 'Case Hardened',    rar: 'blue',   cat: 'Pistol',     marketName: 'Five-SeveN | Case Hardened (Field-Tested)' },
  { w: 'MP9',                 skin: 'Hot Rod',          rar: 'blue',   cat: 'SMG',        marketName: 'MP9 | Hot Rod (Factory New)' },
  { w: 'Nova',                skin: 'Hyper Beast',      rar: 'blue',   cat: 'Shotgun',    marketName: 'Nova | Hyper Beast (Field-Tested)' },
  { w: 'XM1014',              skin: 'Tranquility',      rar: 'blue',   cat: 'Shotgun',    marketName: 'XM1014 | Tranquility (Factory New)' },
  { w: 'Negev',               skin: 'Power Loader',     rar: 'blue',   cat: 'Machinegun', marketName: 'Negev | Power Loader (Factory New)' },
  { w: 'M249',                skin: 'Aztec',            rar: 'blue',   cat: 'Machinegun', marketName: 'M249 | Aztec (Field-Tested)' },
];

export const EXTS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Battle-Scarred'];
export const EXT_SHORT: Record<string, string> = {
  'Factory New': 'FN', 'Minimal Wear': 'MW', 'Field-Tested': 'FT', 'Battle-Scarred': 'BS',
};

export const KNIFE_TYPES = [
  'Bayonet Knife','Bowie Knife','Butterfly Knife','Survival Knife','Paracord Knife',
  'Classic Knife','Falchion Knife','Flip Knife','Gut Knife','Navaja Knife','Karambit Knife',
  'Kukri Knife','Nomad Knife','Shadow Daggers','Skeleton Knife','Stiletto Knife',
  'Huntsman Knife','Ursus Knife','Talon Knife',
];

export const CASE_NAMES = [
  'Pandora Box','Ruby Skeleton','Emerald Vault','Frostbite','Inferno Core',
  'Latte Art','Coffee Bot','Wooden Soldier','Banana Ape','Shark Attack',
  'Pharaoh Relic','Marble Hand','Graffiti Crate','Neon Pulse','Toxic Gloves',
  'Golden Dragon','Medusa Stone','Hazard Orange','Sandstorm','Phoenix Fire',
  'Bloom Garden','Amber Crate','Serpent King','Aqua Maze','Crimson Edge',
  'Viper Strike','Glacier','Solar Flare','Midnight','Jade Tiger',
];

export const TICKER_COLORS = [
  '#9b6bff','#e6c33e','#7a6bff','#e6c33e','#9b6bff','#4b8fff','#4b8fff',
  '#9b6bff','#4b8fff','#9b6bff','#e6c33e','#eb4b4b','#eb4b4b','#9b6bff','#4b8fff','#9b6bff',
];

export const PAY_METHODS = ['Mastercard','Skrill','VISA','Neosurf','Apple Pay','G Pay','paysafecard','NETELLER','PayPal'];
export const SOCIALS = ['𝕏', '✈️', '💬', '🅥'];
export const FOOTER_COLS = [
  { title: 'SkinMaze', links: ['All Cases','Free Cases','Newest','Bestsellers','Signature Cases'] },
  { title: 'Info', links: ['Partnership','Blog','Items','Careers','FAQ','About Us','Provably Fair'] },
  { title: 'Company', links: ['Terms of Service','Legal Opinion','Cookie Policy','AML Policy'] },
];
export const CASE_TABS = [
  'All Cases','Aim Collection','Knifes Collection','Gloves Collection',
  'Pistol Collection','Rifle Collection','Sniper Collection','SMG Collection','Bestsellers',
];
export const BEST_TABS = ['10% Cases','Doppler Knifes','AK-47','Farm AWP','eSports','Latvia Cases'];
export const MP_CATS: Array<[string, string]> = [
  ['Knifes','🔪'],['Pistol','🔫'],['Rifle','🎯'],['Sniper','🔭'],
  ['SMG','💥'],['Shotgun','🪓'],['Machinegun','🔩'],['Gloves','🧤'],
];

export function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function priceForCase(i: number): number {
  const base = [1343.09, 289.50, 742.10, 99.99, 1899.00, 45.20, 512.75, 210.40, 1620.00, 388.90];
  return base[i % base.length];
}

export function priceFor(rar: Rarity): number {
  const r: Record<Rarity, [number, number]> = {
    gold: [3200, 18000], red: [800, 4200], pink: [300, 1200], purple: [80, 420], blue: [5, 70],
  };
  const [lo, hi] = r[rar];
  return +(lo + Math.random() * (hi - lo)).toFixed(2);
}

export function pickRar(): Rarity {
  const r = Math.random() * 100;
  if (r < 3) return 'gold';
  if (r < 11) return 'red';
  if (r < 25) return 'pink';
  if (r < 50) return 'purple';
  return 'blue';
}

export function randItem(): ReelItem {
  const rar = pickRar();
  const pool = POOL.filter(p => p.rar === rar);
  const p = pool[Math.floor(Math.random() * pool.length)] || POOL[0];
  return { w: p.w, skin: p.skin, rar, color: RAR[rar].c, price: fmt(priceFor(rar)), marketName: p.marketName };
}

export function buildCasesAll(): CaseItem[] {
  return CASE_NAMES.map((n, i) => ({
    id: i,
    name: n,
    price: fmt(priceForCase(i)),
    image: CASE_IMAGES[i % CASE_IMAGES.length],
  }));
}

export function buildMpAll(): SkinItem[] {
  const out: SkinItem[] = [];
  let id = 0;
  POOL.forEach((p, i) => {
    out.push({
      id: id++, w: p.w, skin: p.skin, cat: p.cat, rar: p.rar, color: RAR[p.rar].c,
      exterior: EXTS[i % EXTS.length], stat: i % 4 === 0, price: fmt(priceFor(p.rar)),
      ktype: p.cat === 'Knifes' ? KNIFE_TYPES[i % KNIFE_TYPES.length] : null,
    });
  });
  for (let k = 0; k < 8; k++) {
    const p = POOL[(k * 3) % POOL.length];
    out.push({
      id: id++, w: p.w, skin: p.skin, cat: p.cat, rar: p.rar, color: RAR[p.rar].c,
      exterior: EXTS[(k + 1) % EXTS.length], stat: k % 3 === 0, price: fmt(priceFor(p.rar)),
      ktype: p.cat === 'Knifes' ? KNIFE_TYPES[(k + 2) % KNIFE_TYPES.length] : null,
    });
  }
  return out;
}
