'use client';
import { useStore } from '@/app/store/useStore';
import { buildMpAll, MP_CATS, EXTS, KNIFE_TYPES, EXT_SHORT, RAR } from '@/app/lib/data';
import { CoinIcon } from '../CoinIcon';
import { Placeholder } from '../Placeholder';
import type { SkinItem } from '@/app/lib/data';

const mpAll = buildMpAll();
const COLOR_LIST = [
  'linear-gradient(135deg,#fff,#9aa)', '#eb4b4b', '#e23ea0', '#8847ff', '#3a5cff', '#4b9fff',
  '#2ec5b6', '#3ad48f', '#46c041', '#e6c33e', '#e8843e', '#3a3f3a',
];

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
  const { mp, setMpType, toggleExt, setStat, setColor, toggleKnife, setMpSearch, toggleAllKnives, openMpItem, flash } = useStore();

  const filtered: SkinItem[] = mpAll.filter(it => {
    if (mp.type && it.cat !== mp.type) return false;
    if (mp.exts.length && !mp.exts.includes(it.exterior)) return false;
    if (mp.stat === 'no' && it.stat) return false;
    if (mp.stat === 'yes' && !it.stat) return false;
    if (mp.type === 'Knifes' && mp.knives.length && !mp.knives.includes(it.ktype ?? '')) return false;
    if (mp.q) { const q = mp.q.toLowerCase(); if (!(it.w + ' ' + it.skin).toLowerCase().includes(q)) return false; }
    return true;
  });

  const sn = chk(mp.stat === 'no');
  const sy = chk(mp.stat === 'yes');

  return (
    <div>
      {/* Banner */}
      <div style={{ border: '1px solid rgba(95,213,95,.18)', borderRadius: 16, padding: '30px 32px', marginBottom: 24,
        background: 'radial-gradient(ellipse at 30% top,rgba(95,213,95,.14),#0a0d09 70%)' }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 26, margin: '0 0 6px',
          display: 'flex', alignItems: 'center', gap: 10 }}>🛍️ Marketplace</h1>
        <p style={{ margin: 0, color: '#9aa39a', fontSize: 14 }}>Select and buy the CS2 Skins you want to have</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar */}
        <aside style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 6 }}>
          <div style={{ display: 'flex', background: '#0a0d0a', borderRadius: 11, padding: 4, marginBottom: 14 }}>
            <span style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 8, background: '#1c241b', fontWeight: 600, fontSize: 13 }}>Filtres</span>
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
              <input defaultValue="0.000000" style={{ width: '100%', background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: 9, color: '#cfd4cf', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
              <span style={{ color: '#6b746b' }}>-</span>
              <input defaultValue="0.000000" style={{ width: '100%', background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: 9, color: '#cfd4cf', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
            </div>
            {/* Exterior */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Exterior</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            {EXTS.map(e => <CheckRow key={e} label={e} on={mp.exts.includes(e)} onClick={() => toggleExt(e)} />)}
            {/* Sticker */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, margin: '8px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Sticker</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: '9px 12px', marginBottom: 12 }}>
              <span style={{ color: '#6b746b', fontSize: 13 }}>🔍</span><span style={{ color: '#6b746b', fontSize: 13 }}>Search sticker</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 9,
                  backgroundImage: 'repeating-linear-gradient(135deg,rgba(90,150,230,.14) 0 6px,transparent 6px 12px)',
                  border: '1px solid rgba(90,150,230,.2)', display: 'flex', alignItems: 'flex-end',
                  justifyContent: 'center', paddingBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 6, color: '#5a7bb0' }}>KATOWICE 2014</span>
                  {i < 2 && <span style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 4, background: '#46c041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#06270a' }}>✓</span>}
                </div>
              ))}
            </div>
            {/* Colors */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, margin: '14px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Colors</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
              {COLOR_LIST.map((bg, i) => {
                const on = mp.color === i;
                return (
                  <div key={i} onClick={() => setColor(i)} style={{ aspectRatio: '1', borderRadius: 8, background: bg,
                    cursor: 'pointer', border: `2px solid ${on ? '#fff' : 'transparent'}`,
                    boxShadow: on ? '0 0 0 2px rgba(255,255,255,.25)' : 'none' }} />
                );
              })}
            </div>
            {/* StatTrak */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, margin: '14px 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>StatTrak</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            <CheckRow label="No StatTrack" on={mp.stat === 'no'} onClick={() => setStat('no')} />
            <CheckRow label="Has StatTrack" on={mp.stat === 'yes'} onClick={() => setStat('yes')} />
            {/* Delivery */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, margin: '8px 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Delivery</span><span style={{ color: '#6b746b' }}>▾</span>
            </div>
            {[['Instant', true], ['Fast', true], ['Medium', false]].map(([l, on]) => {
              const c = chk(on as boolean);
              return (
                <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0' }}>
                  <span style={{ width: 19, height: 19, borderRadius: 6, background: c.box, border: `1px solid ${c.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#06270a', flexShrink: 0 }}>{c.check}</span>
                  <span style={{ fontSize: 14, color: c.color }}>{l as string}</span>
                </div>
              );
            })}
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
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 14 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px', color: '#9aa39a', fontSize: 14 }}>
              <CoinIcon size={14} />Min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px', color: '#9aa39a', fontSize: 14 }}>
              <CoinIcon size={14} />Max
            </div>
            <div onClick={() => flash('Coming soon ✨')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px', color: '#9aa39a', fontSize: 14, cursor: 'pointer' }}>
              Price: <span style={{ color: '#e8ece8' }}>High to Low</span> ◂
            </div>
          </div>

          {/* Weapon tabs */}
          <div style={{ display: 'flex', gap: 9, marginBottom: 18, overflowX: 'auto', paddingBottom: 6 }}>
            {MP_CATS.map(([label, icon]) => {
              const a = mp.type === label;
              const st = tabStyle(a);
              const kniveBadge = label === 'Knifes' && mp.knives.length ? String(mp.knives.length) : '';
              return (
                <span key={label} onClick={() => setMpType(label)}
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', ...st }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>{label}
                  {kniveBadge && <span style={{ background: '#46c041', color: '#06270a', borderRadius: 6, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{kniveBadge}</span>}
                  <span style={{ color: '#6b746b', fontSize: 10 }}>▾</span>
                </span>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
            {/* Knife subtypes */}
            {mp.type === 'Knifes' && (
              <div style={{ flex: '0 0 270px', background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, overflow: 'hidden' }}>
                <div onClick={() => toggleAllKnives(KNIFE_TYPES)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Select all</span>
                  <span style={{ width: 19, height: 19, borderRadius: 6, border: '1px solid rgba(255,255,255,.2)' }} />
                </div>
                <div style={{ maxHeight: 760, overflowY: 'auto' }}>
                  {KNIFE_TYPES.map(k => {
                    const on = mp.knives.includes(k);
                    const c = chk(on);
                    return (
                      <div key={k} onClick={() => toggleKnife(k)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <span style={{ width: 34, height: 14, borderRadius: 3, background: on ? '#7fe877' : '#3a423a', display: 'inline-block' }} />
                          <span style={{ fontSize: 13.5, color: c.color }}>{k}</span>
                        </span>
                        <span style={{ width: 19, height: 19, borderRadius: 6, background: c.box, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#06270a', flexShrink: 0 }}>{c.check}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 14 }}>
                {filtered.map(it => (
                  <div key={it.id} onClick={() => openMpItem(it)}
                    style={{ position: 'relative', background: '#0b0e0a', border: `1px solid ${it.color}`,
                      borderRadius: 13, padding: '14px 12px 13px', cursor: 'pointer', overflow: 'hidden',
                      transition: 'transform .14s, box-shadow .14s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 26px rgba(0,0,0,.45)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: it.color }} />
                    <div style={{ position: 'absolute', top: 10, left: 10, width: 24, height: 24, borderRadius: 7,
                      background: 'rgba(95,213,95,.16)', border: '1px solid rgba(95,213,95,.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
                    <Placeholder label="skin render" height={118} style={{ margin: '8px 0 11px' }} />
                    <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a' }}>{it.w}</div>
                    <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 13, color: it.color, lineHeight: 1.3 }}>
                      {it.skin} <span style={{ fontSize: 10, color: '#8a928a', fontWeight: 400 }}>{EXT_SHORT[it.exterior] || ''}</span>
                    </div>
                    <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 7, fontSize: 13, color: '#cfd4cf' }}>
                      <CoinIcon size={13} />{it.price}
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', color: '#6b746b', padding: '60px 20px', fontSize: 14 }}>
                  No items match your filters.<br />
                  <span style={{ fontSize: 13 }}>Try enabling more exteriors or weapon types.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
