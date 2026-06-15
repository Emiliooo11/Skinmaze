'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/app/store/useStore';
import { MP_CATS, EXTS, KNIFE_TYPES, POOL, RAR, Rarity, priceFor, fmt } from '@/app/lib/data';
import { CoinIcon } from '../CoinIcon';

const COLOR_LIST = [
  'linear-gradient(135deg,#fff,#9aa)', '#eb4b4b', '#e23ea0', '#8847ff', '#3a5cff', '#4b9fff',
  '#2ec5b6', '#3ad48f', '#46c041', '#e6c33e', '#e8843e', '#3a3f3a',
];

// Build a richer local skin list from POOL (multiple wear variants)
const WEAR_LIST = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Battle-Scarred'];
const WEAR_SHORT: Record<string, string> = { 'Factory New': 'FN', 'Minimal Wear': 'MW', 'Field-Tested': 'FT', 'Battle-Scarred': 'BS' };
const FLOAT_RANGE: Record<string, [number, number]> = {
  'Factory New': [0.000, 0.07],
  'Minimal Wear': [0.07, 0.15],
  'Field-Tested': [0.15, 0.37],
  'Battle-Scarred': [0.45, 1.0],
};

interface LocalSkin {
  id: string;
  name: string;
  skin: string;
  fullName: string;
  wear: string;
  wearShort: string;
  float: number;
  rar: Rarity;
  color: string;
  rarityName: string;
  cat: string;
  price: number;
  priceDisplay: string;
  imageUrl: string;
  isStatTrak: boolean;
}

function seed(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
  return Math.abs(h) / 2147483648;
}

const ALL_SKINS: LocalSkin[] = (() => {
  const out: LocalSkin[] = [];
  let idx = 0;
  for (const p of POOL) {
    for (const wear of WEAR_LIST) {
      const isST = idx % 7 === 0;
      const [flo, fhi] = FLOAT_RANGE[wear];
      const rng = seed(`${p.marketName}-${wear}`);
      const float = +(flo + rng * (fhi - flo)).toFixed(6);
      const price = priceFor(p.rar) * (wear === 'Factory New' ? 1 : wear === 'Minimal Wear' ? 0.75 : wear === 'Field-Tested' ? 0.5 : 0.3);
      out.push({
        id: `${idx++}`,
        name: p.w,
        skin: p.skin,
        fullName: `${isST ? 'StatTrak™ ' : ''}${p.w} | ${p.skin} (${wear})`,
        wear,
        wearShort: WEAR_SHORT[wear],
        float,
        rar: p.rar,
        color: RAR[p.rar].c,
        rarityName: RAR[p.rar].n,
        cat: p.cat,
        price: +price.toFixed(2),
        priceDisplay: fmt(price),
        imageUrl: p.imageUrl,
        isStatTrak: isST,
      });
    }
  }
  return out;
})();

function chk(on: boolean) {
  return { box: on ? '#46c041' : 'transparent', border: on ? '#46c041' : 'rgba(255,255,255,.18)', check: on ? '✓' : '', color: on ? '#e8ece8' : '#9aa39a' };
}
function tabStyle(active: boolean) {
  return {
    border: active ? '1px solid rgba(95,213,95,.5)' : '1px solid rgba(255,255,255,.08)',
    background: active ? 'rgba(95,213,95,.14)' : '#0e120e',
    color: active ? '#7fe877' : '#9aa39a',
  };
}
function CheckRow({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  const c = chk(on);
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', cursor: 'pointer' }}>
      <span style={{ width: 19, height: 19, borderRadius: 6, background: c.box, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#06270a', flexShrink: 0 }}>
        {c.check}
      </span>
      <span style={{ fontSize: 14, color: c.color }}>{label}</span>
    </div>
  );
}

export function MarketplacePage() {
  const { mp, setMpType, toggleExt, setStat, setColor, toggleKnife, setMpSearch, toggleAllKnives, flash } = useStore();
  const [sortBy, setSortBy] = useState<'lowest_price' | 'highest_price' | 'lowest_float' | 'highest_float'>('lowest_price');
  const [selectedItem, setSelectedItem] = useState<LocalSkin | null>(null);
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let list = ALL_SKINS;
    if (mp.type) list = list.filter(it => it.cat === mp.type);
    if (mp.exts.length) list = list.filter(it => mp.exts.includes(it.wear));
    if (mp.stat === 'yes') list = list.filter(it => it.isStatTrak);
    if (mp.stat === 'no') list = list.filter(it => !it.isStatTrak);
    if (mp.q) { const q = mp.q.toLowerCase(); list = list.filter(it => (it.name + ' ' + it.skin).toLowerCase().includes(q)); }
    if (mp.type === 'Knifes' && mp.knives.length) list = list.filter(it => mp.knives.some(k => it.name.includes(k.replace(' Knife', ''))));
    list = [...list].sort((a, b) => {
      if (sortBy === 'lowest_price') return a.price - b.price;
      if (sortBy === 'highest_price') return b.price - a.price;
      if (sortBy === 'lowest_float') return a.float - b.float;
      return b.float - a.float;
    });
    return list;
  }, [mp, sortBy]);

  const sortLabel: Record<string, string> = {
    lowest_price: 'Price: Low to High', highest_price: 'Price: High to Low',
    lowest_float: 'Float: Low to High', highest_float: 'Float: High to Low',
  };
  const sortOptions = Object.keys(sortLabel) as Array<keyof typeof sortLabel>;

  return (
    <div>
      <div style={{ border: '1px solid rgba(95,213,95,.18)', borderRadius: 16, padding: '30px 32px', marginBottom: 24,
        background: 'radial-gradient(ellipse at 30% top,rgba(95,213,95,.14),#0a0d09 70%)' }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 26, margin: '0 0 6px',
          display: 'flex', alignItems: 'center', gap: 10 }}>🛍️ Marketplace</h1>
        <p style={{ margin: 0, color: '#9aa39a', fontSize: 14 }}>CS2 skins — browse and trade</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar */}
        <aside style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 6 }}>
          <div style={{ display: 'flex', background: '#0a0d0a', borderRadius: 11, padding: 4, marginBottom: 14 }}>
            <span style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 8, background: '#1c241b', fontWeight: 600, fontSize: 13 }}>Filters</span>
            <span onClick={() => flash('Coming soon ✨')} style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 8, color: '#8a928a', fontSize: 13, cursor: 'pointer' }}>Trades</span>
          </div>
          <div style={{ padding: '0 12px 14px' }}>
            {/* Float */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Float Value</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            <div style={{ position: 'relative', height: 6, borderRadius: 4, marginBottom: 12,
              background: 'linear-gradient(90deg,#39d44e,#9bd24a 30%,#e0c23a 55%,#e08a3a 75%,#e34a4a)' }}>
              <div style={{ position: 'absolute', left: '2%', top: -3, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2px solid #2a322a' }} />
              <div style={{ position: 'absolute', left: '82%', top: -3, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2px solid #2a322a' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <input defaultValue="0.000" style={{ width: '100%', background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: 9, color: '#cfd4cf', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
              <span style={{ color: '#6b746b' }}>-</span>
              <input defaultValue="1.000" style={{ width: '100%', background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: 9, color: '#cfd4cf', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
            </div>
            {/* Exterior */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Exterior</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            {EXTS.map(e => <CheckRow key={e} label={e} on={mp.exts.includes(e)} onClick={() => toggleExt(e)} />)}
            {/* Colors */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, margin: '14px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Colors</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
              {COLOR_LIST.map((bg, i) => {
                const on = mp.color === i;
                return <div key={i} onClick={() => setColor(i)} style={{ aspectRatio: '1', borderRadius: 8, background: bg, cursor: 'pointer', border: `2px solid ${on ? '#fff' : 'transparent'}`, boxShadow: on ? '0 0 0 2px rgba(255,255,255,.25)' : 'none' }} />;
              })}
            </div>
            {/* StatTrak */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, margin: '14px 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>StatTrak™</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            <CheckRow label="No StatTrak" on={mp.stat === 'no'} onClick={() => setStat('no')} />
            <CheckRow label="Has StatTrak" on={mp.stat === 'yes'} onClick={() => setStat('yes')} />
          </div>
        </aside>

        {/* Right */}
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10,
              background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px' }}>
              <span style={{ color: '#6b746b' }}>🔍</span>
              <input value={mp.q} onChange={e => setMpSearch(e.target.value)} placeholder="Search items..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 14 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowSort(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px', color: '#9aa39a', fontSize: 14, cursor: 'pointer' }}>
                <span style={{ color: '#e8ece8' }}>{sortLabel[sortBy]}</span> ◂
              </div>
              {showSort && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#141914', border: '1px solid rgba(255,255,255,.1)', borderRadius: 11, padding: 6, zIndex: 50, minWidth: 180 }}>
                  {sortOptions.map(s => (
                    <div key={s} onClick={() => { setSortBy(s as typeof sortBy); setShowSort(false); }}
                      style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                        color: sortBy === s ? '#7fe877' : '#cfd4cf', background: sortBy === s ? 'rgba(95,213,95,.12)' : 'transparent' }}>
                      {sortLabel[s]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weapon tabs */}
          <div style={{ display: 'flex', gap: 9, marginBottom: 18, overflowX: 'auto', paddingBottom: 6 }}>
            <span onClick={() => setMpType('')} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', ...tabStyle(!mp.type) }}>All</span>
            {MP_CATS.map(([label, icon]) => (
              <span key={label} onClick={() => setMpType(label)}
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', ...tabStyle(mp.type === label) }}>
                <span style={{ fontSize: 14 }}>{icon}</span>{label}
              </span>
            ))}
          </div>

          {/* Knife subtypes */}
          {mp.type === 'Knifes' && (
            <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, marginBottom: 16, overflow: 'hidden' }}>
              <div onClick={() => toggleAllKnives(KNIFE_TYPES)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', cursor: 'pointer' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Knife types</span>
                <span style={{ fontSize: 12, color: '#6b746b' }}>Select all</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 14 }}>
                {KNIFE_TYPES.map(k => {
                  const on = mp.knives.includes(k);
                  return (
                    <span key={k} onClick={() => toggleKnife(k)} style={{ padding: '6px 13px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500,
                      background: on ? 'rgba(95,213,95,.14)' : '#0e120e',
                      border: on ? '1px solid rgba(95,213,95,.4)' : '1px solid rgba(255,255,255,.08)',
                      color: on ? '#7fe877' : '#9aa39a' }}>{k}</span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 14 }}>
            {filtered.map(it => (
              <div key={it.id} onClick={() => setSelectedItem(it)}
                style={{ position: 'relative', background: '#0b0e0a', border: `1px solid ${it.color}`,
                  borderRadius: 13, padding: '14px 12px 13px', cursor: 'pointer', overflow: 'hidden',
                  transition: 'transform .14s, box-shadow .14s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 26px rgba(0,0,0,.45)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: it.color }} />
                {it.isStatTrak && (
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(207,134,34,.9)', borderRadius: 5, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: '#fff' }}>ST</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 118, margin: '8px 0 10px' }}>
                  <img src={it.imageUrl} alt={it.fullName}
                    style={{ maxHeight: 110, maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.6))' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                </div>
                <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a' }}>{it.name}</div>
                <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: it.color, lineHeight: 1.3 }}>
                  {it.skin} <span style={{ fontSize: 9, color: '#8a928a', fontWeight: 400 }}>{it.wearShort}</span>
                </div>
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6b746b', marginTop: 2 }}>
                  {it.float.toFixed(4)}
                </div>
                <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 6, fontSize: 13, color: '#cfd4cf', fontWeight: 600 }}>
                  <span style={{ color: '#3ad48f', fontWeight: 800, fontSize: 11 }}>$</span>{it.priceDisplay}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b746b', padding: '60px 20px', fontSize: 14 }}>
              No items found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>

      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

function ItemModal({ item, onClose }: { item: LocalSkin; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,6,4,.88)', backdropFilter: 'blur(7px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 24px 40px', overflowY: 'auto' }}>
      <div className="anim-pop" style={{ width: 'min(860px,95vw)', background: '#0d1014', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: 24, boxShadow: '0 40px 100px rgba(0,0,0,.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 17 }}>
            {item.isStatTrak && <span style={{ color: '#cf862a', marginRight: 6 }}>StatTrak™</span>}
            {item.name} | <span style={{ color: item.color }}>{item.skin}</span>{' '}
            <span style={{ fontSize: 11, color: '#8a928a' }}>{item.wear}</span>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: '#1a1f26', border: '1px solid rgba(255,255,255,.1)', color: '#cfd4cf', fontSize: 17, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
          <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', minHeight: 320,
            background: `radial-gradient(ellipse at center,${item.color}22,#0a0d10 72%)`,
            border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 100, height: 4, borderRadius: 3, background: item.color }} />
            <img src={item.imageUrl} alt={item.fullName} style={{ maxHeight: 240, maxWidth: '80%', objectFit: 'contain', filter: `drop-shadow(0 0 30px ${item.color}88)` }} />
          </div>

          <div style={{ background: '#13171d', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ position: 'relative', height: 6, borderRadius: 4, marginBottom: 16,
              background: 'linear-gradient(90deg,#3ad44e,#9bd24a 30%,#e0c23a 55%,#e08a3a 75%,#e34a4a)' }}>
              <div style={{ position: 'absolute', top: -3, left: `${item.float * 100}%`, width: 12, height: 12, borderRadius: '50%', background: '#fff', transform: 'translateX(-50%)', border: '2px solid #1a1f26' }} />
            </div>
            <DetailRow label="Float" value={item.float.toFixed(8)} mono />
            <DetailRow label="Rarity" value={item.rarityName} color={item.color} />
            <DetailRow label="Wear" value={item.wear} />
            <div style={{ flex: 1 }} />
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#0a0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: 13, fontWeight: 700, fontSize: 18 }}>
              <CoinIcon size={18} />{item.priceDisplay}
            </div>
            <button onClick={() => {}} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', borderRadius: 11, padding: 14, border: 'none', cursor: 'pointer' }}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
      <span style={{ fontSize: 13, color: '#9aa39a' }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: 13, fontWeight: 600, color: color || '#cfd4cf' }}>{value}</span>
    </div>
  );
}
