import { POOL, RAR, Rarity, ReelItem, CaseSkin, priceFor, fmt } from './data';
import { usdToCoins } from './currency';

// ── Crypto helpers ──────────────────────────────────────────────────────────

export function generateSeed(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hmacSha256(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Roll generation ─────────────────────────────────────────────────────────
// Standard provably-fair approach:
//   hash = HMAC-SHA256(serverSeed, clientSeed:nonce)
//   Take 4 bytes (8 hex chars) → uint32 → divide by 2^32 → float [0,1)

export async function generateRoll(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): Promise<number> {
  const hash = await hmacSha256(serverSeed, `${clientSeed}:${nonce}`);
  const hex8 = hash.slice(0, 8);
  const int = parseInt(hex8, 16);
  return int / 0x100000000; // divide by 2^32
}

// ── Outcome mapping ─────────────────────────────────────────────────────────
// Same probability distribution as before, now deterministic

function rollToRarity(roll: number): Rarity {
  if (roll < 0.03) return 'gold';
  if (roll < 0.11) return 'red';
  if (roll < 0.25) return 'pink';
  if (roll < 0.50) return 'purple';
  return 'blue';
}

// Use bytes 8–12 to pick the specific item within rarity tier
export async function rollToItem(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  caseSkins?: CaseSkin[],
): Promise<ReelItem & { roll: number; hash: string }> {
  const hash = await hmacSha256(serverSeed, `${clientSeed}:${nonce}`);

  // First 4 bytes → 0-1 roll used for item selection
  const rarityInt = parseInt(hash.slice(0, 8), 16);
  const rarityRoll = rarityInt / 0x100000000;

  // When the case has its own skins, use their drop_chance weights directly
  if (caseSkins && caseSkins.length > 0) {
    const totalWeight = caseSkins.reduce((s, sk) => s + sk.dropChance, 0);
    let cursor = rarityRoll * totalWeight;
    let picked = caseSkins[caseSkins.length - 1];
    for (const sk of caseSkins) {
      cursor -= sk.dropChance;
      if (cursor <= 0) { picked = sk; break; }
    }
    return {
      w: picked.w, skin: picked.skin, rar: picked.rar, color: picked.color,
      price: fmt(picked.price),
      marketName: picked.marketName,
      imageUrl: picked.imageUrl,
      roll: rarityRoll,
      hash,
    };
  }

  // Fallback: hardcoded POOL with rarity tiers
  const rar = rollToRarity(rarityRoll);
  const itemInt = parseInt(hash.slice(8, 16), 16);
  const pool = POOL.filter(p => p.rar === rar);
  const itemIdx = itemInt % pool.length;
  const p = pool[itemIdx] || POOL[0];

  const priceInt = parseInt(hash.slice(16, 24), 16);
  const priceRoll = priceInt / 0x100000000;
  const ranges: Record<Rarity, [number, number]> = {
    gold: [3200, 18000], red: [800, 4200], pink: [300, 1200], purple: [80, 420], blue: [5, 70],
  };
  const [lo, hi] = ranges[rar];
  const usd = +(lo + priceRoll * (hi - lo)).toFixed(2);
  const price = usdToCoins(usd);

  return {
    w: p.w, skin: p.skin, rar, color: RAR[rar].c,
    price: fmt(price),
    marketName: p.marketName,
    imageUrl: p.imageUrl,
    roll: rarityRoll,
    hash,
  };
}

// ── Verification ────────────────────────────────────────────────────────────
// Anyone can re-derive the outcome from the three public inputs

export async function verifyRoll(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): Promise<{ roll: number; rar: Rarity; item: string; hash: string }> {
  const hash = await hmacSha256(serverSeed, `${clientSeed}:${nonce}`);
  const rarityInt = parseInt(hash.slice(0, 8), 16);
  const roll = rarityInt / 0x100000000;
  const rar = rollToRarity(roll);
  const itemInt = parseInt(hash.slice(8, 16), 16);
  const pool = POOL.filter(p => p.rar === rar);
  const p = pool[itemInt % pool.length] || POOL[0];
  return { roll, rar, item: `${p.w} | ${p.skin}`, hash };
}
