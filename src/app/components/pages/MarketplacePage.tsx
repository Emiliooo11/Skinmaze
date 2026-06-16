'use client';
import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/app/store/useStore';
import { MP_CATS, EXTS, KNIFE_TYPES } from '@/app/lib/data';
import { CoinIcon } from '../CoinIcon';

const COLOR_LIST = [
  'linear-gradient(135deg,#fff,#9aa)', '#eb4b4b', '#e23ea0', '#8847ff', '#3a5cff', '#4b9fff',
  '#2ec5b6', '#3ad48f', '#46c041', '#e6c33e', '#e8843e', '#3a3f3a',
];

const RAR_FILTERS = [
  { key: '',       label: 'All',       color: '#9aa39a' },
  { key: 'gold',   label: 'Gold',      color: '#e6c33e' },
  { key: 'red',    label: 'Covert',    color: '#eb4b4b' },
  { key: 'pink',   label: 'Classified',color: '#d32ce6' },
  { key: 'purple', label: 'Restricted',color: '#8847ff' },
  { key: 'blue',   label: 'Mil-Spec',  color: '#4b69ff' },
];

interface SteamSkin {
  id: string; name: string; skin: string; fullName: string;
  wear: string; rar: string; color: string; rarityName: string;
  price: number; priceDisplay: string; imageUrl: string;
  isStatTrak: boolean; listings: number;
}

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
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#06270a', flexShrink: 0 }}>{c.check}</span>
      <span style={{ fontSize: 14, color: c.color }}>{label}</span>
    </div>
  );
}

export function MarketplacePage() {
  const { mp, setMpType, toggleExt, setStat, setColor, toggleKnife, setMpSearch, toggleAllKnives, flash } = useStore();
  const [sort, setSort] = useState<'price_desc' | 'price_asc' | 'name'>('price_desc');
  const [rarity, setRarity] = useState('');
  const [selectedItem, setSelectedItem] = useState<SteamSkin | null>(null);
  const [showSort, setShowSort] = useState(false);
  const [skins, setSkins] = useState<SteamSkin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  // Fetch when category, rarity, or sort changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const qs = new URLSearchParams({ count: '100', sort });
    if (mp.type) qs.set('category', mp.type);
    if (rarity)  qs.set('rarity', rarity);
    fetch(`/api/skin-search?${qs}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.error) { setError(d.error); setSkins([]); }
        else { setSkins(d.results || []); setTotal(d.total || 0); }
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [mp.type, rarity, sort]);

  const filtered = useMemo(() => {
    let list = skins;
    if (mp.exts.length) list = list.filter(it => mp.exts.includes(it.wear));
    if (mp.stat === 'yes') list = list.filter(it => it.isStatTrak);
    if (mp.stat === 'no')  list = list.filter(it => !it.isStatTrak);
    if (mp.q) { const q = mp.q.toLowerCase(); list = list.filter(it => (it.name + ' ' + it.skin).toLowerCase().includes(q)); }
    if (mp.type === 'Knifes' && mp.knives.length) list = list.filter(it => mp.knives.some(k => it.name.includes(k.replace(' Knife', ''))));
    return list;
  }, [skins, mp]);

  const sortLabel: Record<string, string> = { price_desc: 'Price: High to Low', price_asc: 'Price: Low to High', name: 'Name A–Z' };
  const sortOptions = Object.keys(sortLabel) as Array<keyof typeof sortLabel>;

  return (
    <div>
      {/* Banner */}
      <div style={{ border: '1px solid rgba(95,213,95,.18)', borderRadius: 16, padding: '26px 32px', marginBottom: 24,
        background: 'radial-gradient(ellipse at 30% top,rgba(95,213,95,.14),#0a0d09 70%)' }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 26, margin: '0 0 4px',
          display: 'flex', alignItems: 'center', gap: 10 }}>🛍️ Marketplace</h1>
        <p style={{ margin: 0, color: '#9aa39a', fontSize: 14 }}>
          CS2 skins — live Steam Market prices
          {total > 0 && !loading && <span style={{ color: '#4a7a4a' }}> · {total.toLocaleString()} listings available</span>}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar */}
        <aside style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 6 }}>
          <div style={{ display: 'flex', background: '#0a0d0a', borderRadius: 11, padding: 4, marginBottom: 14 }}>
            <span style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 8, background: '#1c241b', fontWeight: 600, fontSize: 13 }}>Filters</span>
            <span onClick={() => flash('Coming soon ✨')} style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 8, color: '#8a928a', fontSize: 13, cursor: 'pointer' }}>Trades</span>
          </div>
          <div style={{ padding: '0 12px 14px' }}>

            {/* Rarity */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Rarity</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
              {RAR_FILTERS.map(r => (
                <div key={r.key} onClick={() => setRarity(r.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, cursor: 'pointer',
                    background: rarity === r.key ? 'rgba(95,213,95,.08)' : 'transparent',
                    border: `1px solid ${rarity === r.key ? 'rgba(95,213,95,.25)' : 'transparent'}` }}>
                  {r.key && <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color, flexShrink: 0 }} />}
                  {!r.key && <div style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(135deg,#e6c33e,#eb4b4b,#8847ff,#4b69ff)', flexShrink: 0 }} />}
                  <span style={{ fontSize: 13, color: rarity === r.key ? '#cfd4cf' : '#9aa39a' }}>{r.label}</span>
                </div>
              ))}
            </div>

            {/* Exterior */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Exterior</span>
            </div>
            {EXTS.map(e => <CheckRow key={e} label={e} on={mp.exts.includes(e)} onClick={() => toggleExt(e)} />)}

            {/* Colors */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, margin: '14px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Colors</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
              {COLOR_LIST.map((bg, i) => {
                const on = mp.color === i;
                return <div key={i} onClick={() => setColor(i)} style={{ aspectRatio: '1', borderRadius: 8, background: bg, cursor: 'pointer', border: `2px solid ${on ? '#fff' : 'transparent'}`, boxShadow: on ? '0 0 0 2px rgba(255,255,255,.25)' : 'none' }} />;
              })}
            </div>

            {/* StatTrak */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, margin: '14px 0 6px' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>StatTrak™</span>
            </div>
            <CheckRow label="No StatTrak" on={mp.stat === 'no'}  onClick={() => setStat('no')} />
            <CheckRow label="Has StatTrak" on={mp.stat === 'yes'} onClick={() => setStat('yes')} />
          </div>
        </aside>

        {/* Right */}
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10,
              background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '11px 16px' }}>
              <span style={{ color: '#6b746b' }}>🔍</span>
              <input value={mp.q} onChange={e => setMpSearch(e.target.value)} placeholder="Search items..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 14 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowSort(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '11px 16px', color: '#9aa39a', fontSize: 14, cursor: 'pointer' }}>
                <span style={{ color: '#e8ece8' }}>{sortLabel[sort]}</span> ◂
              </div>
              {showSort && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#141914', border: '1px solid rgba(255,255,255,.1)', borderRadius: 11, padding: 6, zIndex: 50, minWidth: 180 }}>
                  {sortOptions.map(s => (
                    <div key={s} onClick={() => { setSort(s as typeof sort); setShowSort(false); }}
                      style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                        color: sort === s ? '#7fe877' : '#cfd4cf', background: sort === s ? 'rgba(95,213,95,.12)' : 'transparent' }}>
                      {sortLabel[s]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
            <span onClick={() => setMpType('')} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', ...tabStyle(!mp.type) }}>All</span>
            {MP_CATS.map(([label, icon]) => (
              <span key={label} onClick={() => setMpType(label)}
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', ...tabStyle(mp.type === label) }}>
                <span style={{ fontSize: 13 }}>{icon}</span>{label}
              </span>
            ))}
          </div>

          {/* Knife subtypes */}
          {mp.type === 'Knifes' && (
            <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, marginBottom: 14, overflow: 'hidden' }}>
              <div onClick={() => toggleAllKnives(KNIFE_TYPES)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', cursor: 'pointer' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Knife types</span>
                <span style={{ fontSize: 12, color: '#6b746b' }}>Select all</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: 12 }}>
                {KNIFE_TYPES.map(k => {
                  const on = mp.knives.includes(k);
                  return (
                    <span key={k} onClick={() => toggleKnife(k)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500,
                      background: on ? 'rgba(95,213,95,.14)' : '#0e120e', border: on ? '1px solid rgba(95,213,95,.4)' : '1px solid rgba(255,255,255,.08)', color: on ? '#7fe877' : '#9aa39a' }}>
                      {k}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 12 }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{ height: 215, borderRadius: 13, background: '#0b0e0a', border: '1px solid rgba(255,255,255,.05)',
                  animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.04}s` }} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: '#eb4b4b', marginBottom: 8, fontSize: 14 }}>Failed to load skins</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b746b', marginBottom: 16 }}>{error}</div>
              <button onClick={() => setRarity(rarity)} style={{ background: '#1c241b', border: '1px solid rgba(95,213,95,.3)', borderRadius: 10, padding: '10px 24px', color: '#7fe877', cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && (
            <>
              {filtered.length > 0 && (
                <div style={{ fontSize: 12, color: '#4a7a4a', marginBottom: 10 }}>
                  Showing {filtered.length} of {total.toLocaleString()} available
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 12 }}>
                {filtered.map(it => (
                  <div key={it.id + it.fullName} onClick={() => setSelectedItem(it)}
                    style={{ position: 'relative', background: '#0b0e0a', border: `1px solid ${it.color}55`,
                      borderRadius: 13, padding: '13px 11px 12px', cursor: 'pointer', overflow: 'hidden',
                      transition: 'transform .14s, box-shadow .14s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 12px 26px rgba(0,0,0,.45)`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: it.color }} />
                    {it.isStatTrak && (
                      <div style={{ position: 'absolute', top: 9, left: 9, background: 'rgba(207,134,34,.9)', borderRadius: 5, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: '#fff' }}>ST</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 110, margin: '6px 0 9px' }}>
                      {it.imageUrl
                        ? <img src={it.imageUrl} alt={it.fullName} style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.6))' }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                        : <div style={{ width: 80, height: 80, borderRadius: 10, background: 'repeating-linear-gradient(135deg,rgba(255,255,255,.03) 0 6px,transparent 6px 12px)' }} />
                      }
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 10, color: '#9aa39a', marginBottom: 2 }}>{it.name}</div>
                    <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 11, color: it.color, lineHeight: 1.3 }}>
                      {it.skin}{it.wear ? <span style={{ fontSize: 9, color: '#6b746b', fontWeight: 400 }}> {it.wear.split(' ').map(w => w[0]).join('')}</span> : null}
                    </div>
                    <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 7, fontSize: 13, fontWeight: 700 }}>
                      <span style={{ color: '#3ad48f', fontSize: 10 }}>$</span>{it.priceDisplay}
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', color: '#6b746b', padding: '60px 20px', fontSize: 14 }}>
                  No items match your filters.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

function ItemModal({ item, onClose }: { item: SteamSkin; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,6,4,.88)', backdropFilter: 'blur(7px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 24px 40px', overflowY: 'auto' }}>
      <div className="anim-pop" style={{ width: 'min(760px,95vw)', background: '#0d1014', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: 24, boxShadow: '0 40px 100px rgba(0,0,0,.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 16 }}>
            {item.isStatTrak && <span style={{ color: '#cf862a', marginRight: 6 }}>StatTrak™</span>}
            {item.name} | <span style={{ color: item.color }}>{item.skin}</span>
            {item.wear && <span style={{ fontSize: 11, color: '#8a928a', marginLeft: 6 }}>{item.wear}</span>}
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: '#1a1f26', border: '1px solid rgba(255,255,255,.1)', color: '#cfd4cf', fontSize: 17, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
          <div style={{ borderRadius: 14, minHeight: 280, background: `radial-gradient(ellipse at center,${item.color}22,#0a0d10 72%)`,
            border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.imageUrl && <img src={item.imageUrl} alt={item.fullName} style={{ maxHeight: 220, maxWidth: '80%', objectFit: 'contain', filter: `drop-shadow(0 0 30px ${item.color}88)` }} />}
          </div>
          <div style={{ background: '#13171d', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <DetailRow label="Rarity"    value={item.rarityName} color={item.color} />
            <DetailRow label="Wear"      value={item.wear || '—'} />
            <DetailRow label="Listings"  value={item.listings.toLocaleString()} />
            <div style={{ flex: 1 }} />
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#0a0d12', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: 13, fontWeight: 700, fontSize: 20 }}>
              <CoinIcon size={20} />{item.priceDisplay}
            </div>
            <button onClick={onClose} style={{ marginTop: 10, fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', borderRadius: 11, padding: 14, border: 'none', cursor: 'pointer' }}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
      <span style={{ fontSize: 13, color: '#9aa39a' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: color || '#cfd4cf' }}>{value}</span>
    </div>
  );
}
