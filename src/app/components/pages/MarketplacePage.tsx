'use client';
import { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { MP_CATS, EXTS, KNIFE_TYPES } from '@/app/lib/data';
import { useListings } from '@/app/lib/useListings';
import { NormalizedSkin } from '@/app/lib/csfloat';
import { CoinIcon } from '../CoinIcon';

const COLOR_LIST = [
  'linear-gradient(135deg,#fff,#9aa)', '#eb4b4b', '#e23ea0', '#8847ff', '#3a5cff', '#4b9fff',
  '#2ec5b6', '#3ad48f', '#46c041', '#e6c33e', '#e8843e', '#3a3f3a',
];

// CSFloat category ints for common weapon types
const CAT_MAP: Record<string, number> = {
  Knifes: 0, Gloves: 6, Pistol: 1, Rifle: 2, Sniper: 3, SMG: 4, Shotgun: 5, Machinegun: 7,
};

// CSFloat rarity ints
const RAR_MAP: Record<string, number> = {
  blue: 3, purple: 4, pink: 5, red: 6, gold: 7,
};

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
  const [selectedItem, setSelectedItem] = useState<NormalizedSkin | null>(null);

  const { data: listings, loading, error, refetch } = useListings({
    limit: 48,
    type: 'buy_now',
    category: mp.type ? CAT_MAP[mp.type] : undefined,
    sort_by: sortBy,
    ...(mp.stat === 'yes' ? { market_hash_name: 'StatTrak' } : {}),
  });

  const filtered = listings.filter(it => {
    if (mp.q) {
      const q = mp.q.toLowerCase();
      if (!(it.name + ' ' + it.skin).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sortLabel: Record<string, string> = {
    lowest_price: 'Price: Low to High',
    highest_price: 'Price: High to Low',
    lowest_float: 'Float: Low to High',
    highest_float: 'Float: High to Low',
  };
  const sortOptions = Object.keys(sortLabel) as Array<keyof typeof sortLabel>;
  const [showSort, setShowSort] = useState(false);

  return (
    <div>
      {/* Banner */}
      <div style={{ border: '1px solid rgba(95,213,95,.18)', borderRadius: 16, padding: '30px 32px', marginBottom: 24,
        background: 'radial-gradient(ellipse at 30% top,rgba(95,213,95,.14),#0a0d09 70%)' }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 26, margin: '0 0 6px',
          display: 'flex', alignItems: 'center', gap: 10 }}>🛍️ Marketplace</h1>
        <p style={{ margin: 0, color: '#9aa39a', fontSize: 14 }}>Live CS2 skins from CSFloat — buy now listings</p>
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
            {/* Sort */}
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
            <button onClick={refetch} style={{ background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px', color: '#9aa39a', fontSize: 14, cursor: 'pointer' }}>↻ Refresh</button>
          </div>

          {/* Weapon tabs */}
          <div style={{ display: 'flex', gap: 9, marginBottom: 18, overflowX: 'auto', paddingBottom: 6 }}>
            <span onClick={() => setMpType('')} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', ...tabStyle(!mp.type) }}>All</span>
            {MP_CATS.map(([label, icon]) => {
              const a = mp.type === label;
              return (
                <span key={label} onClick={() => setMpType(label)}
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', ...tabStyle(a) }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>{label}
                </span>
              );
            })}
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

          {/* States */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 14 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ height: 220, borderRadius: 13, background: '#0b0e0a', border: '1px solid rgba(255,255,255,.05)', animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: '#eb4b4b', marginBottom: 12 }}>Failed to load listings</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b746b', marginBottom: 16 }}>{error}</div>
              <button onClick={refetch} style={{ background: '#1c241b', border: '1px solid rgba(95,213,95,.3)', borderRadius: 10, padding: '10px 24px', color: '#7fe877', cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {/* Items grid */}
          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 14 }}>
              {filtered.map(it => (
                <div key={it.id} onClick={() => setSelectedItem(it)}
                  style={{ position: 'relative', background: '#0b0e0a', border: `1px solid ${it.color}`,
                    borderRadius: 13, padding: '14px 12px 13px', cursor: 'pointer', overflow: 'hidden',
                    transition: 'transform .14s, box-shadow .14s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 12px 26px rgba(0,0,0,.45)`; }}
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
                    {it.skin} <span style={{ fontSize: 9, color: '#8a928a', fontWeight: 400 }}>{it.wear?.slice(0, 2)}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6b746b', marginTop: 2 }}>
                    {it.float != null ? it.float.toFixed(4) : '—'}
                  </div>
                  <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 6, fontSize: 13, color: '#cfd4cf', fontWeight: 600 }}>
                    <span style={{ color: '#3ad48f', fontWeight: 800, fontSize: 11 }}>$</span>{it.priceDisplay}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b746b', padding: '60px 20px', fontSize: 14 }}>
              No items found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>

      {/* Item detail modal */}
      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

function ItemModal({ item, onClose }: { item: NormalizedSkin; onClose: () => void }) {
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
          {/* Image panel */}
          <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', minHeight: 320,
            background: `radial-gradient(ellipse at center,${item.color}22,#0a0d10 72%)`,
            border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 100, height: 4, borderRadius: 3, background: item.color }} />
            <img src={item.imageUrl} alt={item.fullName} style={{ maxHeight: 240, maxWidth: '80%', objectFit: 'contain', filter: `drop-shadow(0 0 30px ${item.color}88)` }} />
          </div>

          {/* Details panel */}
          <div style={{ background: '#13171d', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Float bar */}
            <div style={{ position: 'relative', height: 6, borderRadius: 4, marginBottom: 16,
              background: 'linear-gradient(90deg,#3ad44e,#9bd24a 30%,#e0c23a 55%,#e08a3a 75%,#e34a4a)' }}>
              <div style={{ position: 'absolute', top: -3, left: `${(item.float ?? 0.5) * 100}%`, width: 12, height: 12, borderRadius: '50%', background: '#fff', transform: 'translateX(-50%)', border: '2px solid #1a1f26' }} />
            </div>

            {item.float != null && <DetailRow label="Float" value={item.float.toFixed(8)} mono />}
            <DetailRow label="Rarity" value={item.rarityName} color={item.color} />
            <DetailRow label="Wear" value={item.wear} />
            {item.phase && <DetailRow label="Phase" value={item.phase} color={item.color} />}
            {item.collection && <DetailRow label="Collection" value={item.collection} />}

            {/* Stickers */}
            {item.stickers.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 8 }}>Stickers</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {item.stickers.sort((a, b) => a.slot - b.slot).map((s, i) => (
                    <div key={i} title={s.name} style={{ width: 44, height: 44, borderRadius: 8, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={s.iconUrl} alt={s.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ flex: 1 }} />
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#0a0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: 13, fontWeight: 700, fontSize: 18 }}>
              <span style={{ color: '#3ad48f', fontWeight: 800 }}>$</span>{item.priceDisplay}
            </div>
            <a href={`https://csfloat.com/item/${item.id}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', borderRadius: 11, padding: 14, textDecoration: 'none' }}>
              Buy on CSFloat ↗
            </a>
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
