import { usdToCoins, fmtCoins } from './currency';

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
  imageUrl?: string;
}

export interface CaseItem {
  id: string;
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

const STEAM = (icon: string) => `https://community.fastly.steamstatic.com/economy/image/${icon}`;

export const POOL: Array<{ w: string; skin: string; rar: Rarity; cat: Category; marketName: string; imageUrl: string }> = [
  { w: 'AWP',                  skin: 'Dragon Lore',      rar: 'gold',   cat: 'Sniper',     marketName: 'AWP | Dragon Lore (Factory New)',                         imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV') },
  { w: '★ Karambit',          skin: 'Fade',             rar: 'gold',   cat: 'Knifes',     marketName: '★ Karambit | Fade (Factory New)',                         imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8') },
  { w: '★ Butterfly Knife',   skin: 'Slaughter',        rar: 'gold',   cat: 'Knifes',     marketName: '★ Butterfly Knife | Slaughter (Factory New)',             imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Z-ua6bbZrLOmsD2qv2-t0ouBWQyC0nQlp4G_dmdauIC_DPQBzDpclRLINsEXsx92yP7jq7gXd2t1NzCT3iCwc6TErvbhfNpboFw') },
  { w: '★ Bayonet',           skin: 'Doppler',          rar: 'gold',   cat: 'Knifes',     marketName: '★ Bayonet | Doppler (Factory New)',                       imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzn4_v8ydP0POjV7Z4IumsA2aCw-JzuftsSxa_nBovp3PWnomsdn2QPVN0D5UiEOUP50LtltTvY-Ll4g3YjItFmSv-2i9A6X4-_a9cBu2YVmHc') },
  { w: '★ Sport Gloves',      skin: "Pandora's Box",    rar: 'gold',   cat: 'Gloves',     marketName: "★ Sport Gloves | Pandora's Box (Field-Tested)",           imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk5UvzWCL2kpn2-DFk_OKherB0H-CGHHecxNF7teVgWiT9wU4jsmyDyt74dn-WOwUhApchQLYD4Rm4ktDlMbzjs1DajtlCmy6vijQJsHhHS4AXoA') },
  { w: 'M4A4',                skin: 'Howl',             rar: 'red',    cat: 'Rifle',      marketName: 'M4A4 | Howl (Field-Tested)',                              imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afVSKP-EAm6extF7teVgWiT9wh5_5zyAwo6oeSrDawUkCMN0QbEM5BO-wNazMe3qsgHZg4wQyy-t2jQJsHi3nDJ37A') },
  { w: 'AWP',                  skin: 'Asiimov',          rar: 'red',    cat: 'Sniper',     marketName: 'AWP | Asiimov (Field-Tested)',                            imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ') },
  { w: 'Desert Eagle',         skin: 'Blaze',            rar: 'red',    cat: 'Pistol',     marketName: 'Desert Eagle | Blaze (Factory New)',                      imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7vORbqhsLfWAMWuZxuZi_uI_TX6wxxkjsGXXnImsJ37COlUoWcByEOMOtxa5kdXmNu3htVPZjN1bjXKpkHLRfQU') },
  { w: 'USP-S',               skin: 'Kill Confirmed',   rar: 'red',    cat: 'Pistol',     marketName: 'USP-S | Kill Confirmed (Field-Tested)',                   imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_uV_vO1WTCa9kxQ1vjiBpYL8JSLSMxghCMEjEeNe5hHpw9zhYuOz5VfcitpBmyqt3X9O6itrsesFUfYmrKzTkUifZqPQtnZK') },
  { w: '★ Specialist Gloves', skin: 'Crimson Kimono',   rar: 'red',    cat: 'Gloves',     marketName: '★ Specialist Gloves | Crimson Kimono (Well-Worn)',        imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk71ruQBH4jYLf-i5U-fe9V7d9JfOaD2uZ0vpJu-hkQCe8qhkusjCKlIvqHjnCOml9X8YpALoUt0buw9XvZu3n5QXcjt8Rz374hitJ7y1ut7wGBPIn_KHX2g-TZeU65Y5DeqiDpqFsBg') },
  { w: 'AK-47',               skin: 'Vulcan',           rar: 'pink',   cat: 'Rifle',      marketName: 'AK-47 | Vulcan (Field-Tested)',                           imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSMuWRDGKC_uNztOh8QmeylBh1426Gz437JyrEOA5zD5N0Q-MOsEG4moe2Yrjr5w2Pid8Rnir3kGoXuUSY1H7U') },
  { w: 'M4A1-S',              skin: 'Hyper Beast',      rar: 'pink',   cat: 'Rifle',      marketName: 'M4A1-S | Hyper Beast (Field-Tested)',                    imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9JuPh5SjuMlxgmoCm6l4r9KD7KcA50WcR0R7NctBm_k9fgN7nn4FGMitpCxH-vjikc6Cs4t-5TVaMgr_bJz1aWEz9VGgc') },
  { w: 'AWP',                  skin: 'Hyper Beast',      rar: 'pink',   cat: 'Sniper',     marketName: 'AWP | Hyper Beast (Field-Tested)',                        imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6x0MPWBMWWVwP1ij-xsSyCmmFMj62Tcwt-gJC_BbwNyDZokQu8I4BK6wdazMuq35AbW3YIWmy_4h3tO8G81tKCz9TDP') },
  { w: '★ Driver Gloves',     skin: 'King Snake',       rar: 'pink',   cat: 'Gloves',     marketName: '★ Driver Gloves | King Snake (Field-Tested)',             imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5T441rsfhr9kYDl7h1I4_utY5t-LvGYC3SbyOBJp-lgWyyMmBgjuiiI1Nv_d33BaQUjA8MmF-QCskbswdTvY7_q7leNiN0Rnyz-3y4f6HxvsL4cEf1yOUfFUFk') },
  { w: 'AK-47',               skin: 'Redline',          rar: 'pink',   cat: 'Rifle',      marketName: 'AK-47 | Redline (Field-Tested)',                          imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzOtyufRkASq2lkxx4W-HnNyqJC3FZwYoC5p0Q7FfthW6wdWxPu-371Pdit5HnyXgznQeHYY5wyA') },
  { w: 'AK-47',               skin: 'Slate',            rar: 'purple', cat: 'Rifle',      marketName: 'AK-47 | Slate (Factory New)',                             imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiVI0POlPPNSMOKcCGKD0ud5vuBlcCW6khUz_W3Sytb4cCqTOFUpWJtzTOUD5hPsw9a0Yrnrs1SK3ooXzy6shilM5311o7FVYrIufmI') },
  { w: 'Glock-18',            skin: 'Water Elemental',  rar: 'purple', cat: 'Pistol',     marketName: 'Glock-18 | Water Elemental (Field-Tested)',               imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK72fB3aFxP11te99cCS2kRQyvnOGnNiodi6RPwEkWJV2EeFbtBTqkoDjMezk5wbZj4wRzi_2iShIuyls_a9cBjdLVuOU') },
  { w: 'P250',                skin: 'Asiimov',          rar: 'purple', cat: 'Pistol',     marketName: 'P250 | Asiimov (Field-Tested)',                           imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiFO0OL8PfRSIeOaB2qf19F7teVgWiT9wxx36mWHzIuseXnCOlUgXsclQONf5Bi4x4bhNru34VPejdgXyS3-3DQJsHj2UM_3gw') },
  { w: 'MP9',                 skin: 'Rose Iron',        rar: 'purple', cat: 'SMG',        marketName: 'MP9 | Rose Iron (Factory New)',                           imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f_C9k-_qheqp0H-KcHWKvzP4vj-1gSCGn20h0423Wn9qoJH6QOwNxXpRxQOQLtEHumtTvP-i05wyMjN5Hz3qtiy1XrnE8Sl7QOgI') },
  { w: 'MAC-10',              skin: 'Neon Rider',       rar: 'purple', cat: 'SMG',        marketName: 'MAC-10 | Neon Rider (Field-Tested)',                      imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-dC2ie0-dytfNWQiy3nAgq_W-An9yvIi2WbgZzA5RwF-QL5BDumoC0NL_kswCK2YIQmymt2y0Y5nl1o7FV43jaksE') },
  { w: 'Five-SeveN',          skin: 'Case Hardened',    rar: 'blue',   cat: 'Pistol',     marketName: 'Five-SeveN | Case Hardened (Field-Tested)',               imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRabVSL_mfC2OvzOtyufRkAS3hlkxz5mSHzYmrd3KSPwMiWcAiFuBYsRS-lYbiNO7m5Fbej4tAzCTgznQeYJ59fyc') },
  { w: 'MP9',                 skin: 'Hot Rod',          rar: 'blue',   cat: 'SMG',        marketName: 'MP9 | Hot Rod (Factory New)',                             imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f_Cxk_feqV6hkJ_iHQD7Cl7ou5rlsGyi2wBgh4WyDytmqcC6fbQAhC8chEeZZtRLrw4LlNLz8p1uJeM3XA-E') },
  { w: 'Nova',                skin: 'Hyper Beast',      rar: 'blue',   cat: 'Shotgun',    marketName: 'Nova | Hyper Beast (Field-Tested)',                       imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwiFO0PyhfqVSKOmDC3WSxO9lpN5kSi26gBBp6juAmImgIyqWPAQnA5JzTO4C4EHqwNHiZe_i4wbY3otBziStjS5J6zErvbi3rfP3KQ') },
  { w: 'XM1014',              skin: 'Tranquility',      rar: 'blue',   cat: 'Shotgun',    marketName: 'XM1014 | Tranquility (Factory New)',                      imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7OeRcKk8cKHHMWSR0-disfJWQyC0nQlp5zjWnNigIC-falMlWMN2F-cP5Ba-xoXlMri0swTZg41EyX34jS1LuDErvbgNI5zBZg') },
  { w: 'Negev',               skin: 'Power Loader',     rar: 'blue',   cat: 'Machinegun', marketName: 'Negev | Power Loader (Factory New)',                      imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_m5Hl6x1Y-s2gbaNoNs-aA3eRwvpJvOhuRz39lE914j-HyYmscHLBZ1J1X5NyEbYI5Be8k4DmYuzh4AGIgo0QzSqs3TQJsHgPf9N5RQ') },
  { w: 'M249',                skin: 'Aztec',            rar: 'blue',   cat: 'Machinegun', marketName: 'M249 | Aztec (Field-Tested)',                             imageUrl: STEAM('i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8zMK5wiNK0P_8PP1SIeqHC2SvzOtyufRkAXDmlkQktTvUydysdH-RaFB0W5V0QrYOtkW7ldayN-jr5wffj4wWyyzgznQe5C6Zauo') },
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
  return fmtCoins(n);
}

// USD prices for cases — converted to coins at display time
const CASE_USD_PRICES = [1343.09, 289.50, 742.10, 99.99, 1899.00, 45.20, 512.75, 210.40, 1620.00, 388.90];

export function priceForCase(i: number): number {
  return usdToCoins(CASE_USD_PRICES[i % CASE_USD_PRICES.length]);
}

// USD price ranges per rarity — returned as coins
export function priceFor(rar: Rarity): number {
  const r: Record<Rarity, [number, number]> = {
    gold: [3200, 18000], red: [800, 4200], pink: [300, 1200], purple: [80, 420], blue: [5, 70],
  };
  const [lo, hi] = r[rar];
  const usd = +(lo + Math.random() * (hi - lo)).toFixed(2);
  return usdToCoins(usd);
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
  return { w: p.w, skin: p.skin, rar, color: RAR[rar].c, price: fmt(priceFor(rar)), marketName: p.marketName, imageUrl: p.imageUrl };
}

export function buildCasesAll(): CaseItem[] {
  return CASE_NAMES.map((n, i) => ({
    id: String(i),
    name: n,
    price: fmt(priceForCase(i)),
    image: CASE_IMAGES[i % CASE_IMAGES.length],
  }));
}

// Drop chances that match rollToRarity / pickRar
export const RAR_CHANCES: Record<Rarity, number> = {
  gold:   3,
  red:    8,   // 11 - 3
  pink:   14,  // 25 - 11
  purple: 25,  // 50 - 25
  blue:   50,  // 100 - 50
};

const RAR_ORDER: Rarity[] = ['gold', 'red', 'pink', 'purple', 'blue'];

// Stable midpoint price per rarity (no Math.random — avoids hydration mismatch)
function midPrice(rar: Rarity): number {
  const r: Record<Rarity, [number, number]> = {
    gold: [3200, 18000], red: [800, 4200], pink: [300, 1200], purple: [80, 420], blue: [5, 70],
  };
  const [lo, hi] = r[rar];
  return usdToCoins((lo + hi) / 2);
}

/** All items in POOL sorted rarest-first, with per-item drop chance (shared equally within rarity) */
export function buildCaseContents(): Array<{ w: string; skin: string; rar: Rarity; color: string; marketName: string; imageUrl: string; chancePct: string; price: string }> {
  const byRarity = RAR_ORDER.map(rar => {
    const items = POOL.filter(p => p.rar === rar);
    const perItem = RAR_CHANCES[rar] / items.length;
    const price = fmt(midPrice(rar));
    return items.map(p => ({
      w: p.w, skin: p.skin, rar, color: RAR[rar].c,
      marketName: p.marketName, imageUrl: p.imageUrl,
      chancePct: perItem < 1 ? perItem.toFixed(2) : perItem.toFixed(1),
      price,
    }));
  });
  return byRarity.flat();
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
