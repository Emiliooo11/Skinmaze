'use client';
import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/app/store/useStore';
import { NormalizedSkin } from '@/app/lib/csfloat';
import { CASE_IMAGES, RAR, Rarity } from '@/app/lib/data';
import { SkinImage } from '../SkinImage';
import { CoinIcon } from '../CoinIcon';

const DEFAULT_HOUSE_EDGE = 9; // percent

interface AdminSkin {
  id: string;
  name: string;
  skin: string;
  marketName: string;
  rar: Rarity;
  color: string;
  imageUrl: string;
  price: number;      // USD reference price from CSFloat
  dropChance: number; // percent, 0–100
}

interface AdminCase {
  id: string;
  name: string;
  price: string;      // auto-computed, stored as display string
  houseEdge: number;  // percent, default 9
  image: string;
  skins: AdminSkin[];
  createdAt: string;
}

const STORAGE_KEY = 'sm_admin_cases';

function loadCases(): AdminCase[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveCases(cases: AdminCase[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

// Compute expected value and suggested price from skins + house edge
function calcEV(skins: AdminSkin[]): number {
  return skins.reduce((sum, s) => sum + s.price * (s.dropChance / 100), 0);
}
function calcPrice(skins: AdminSkin[], houseEdge: number): number {
  const ev = calcEV(skins);
  if (ev <= 0) return 0;
  return ev / (1 - houseEdge / 100);
}
function totalChance(skins: AdminSkin[]): number {
  return skins.reduce((sum, s) => sum + s.dropChance, 0);
}

// Map CSFloat rarityName → our Rarity
const RAR_MAP: Record<string, Rarity> = {
  'Consumer Grade': 'blue', 'Industrial Grade': 'blue', 'Mil-Spec Grade': 'blue',
  'Restricted': 'purple', 'Classified': 'pink', 'Covert': 'red',
  'Extraordinary': 'gold', 'Exceedingly Rare ★': 'gold',
  'High Grade': 'blue', 'Remarkable': 'purple', 'Exotic': 'pink', 'Contraband': 'gold',
};

// Suggested default drop chances by rarity (CS2 convention)
const RAR_DEFAULT_CHANCE: Record<Rarity, number> = {
  gold: 0.26, red: 0.64, pink: 3.2, purple: 15.98, blue: 79.92,
};

export function AdminPage() {
  const { go } = useStore();
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [editing, setEditing] = useState<AdminCase | null>(null);

  useEffect(() => { setCases(loadCases()); }, []);

  function saveCase(c: AdminCase) {
    const next = cases.some(x => x.id === c.id)
      ? cases.map(x => x.id === c.id ? c : x)
      : [...cases, c];
    setCases(next);
    saveCases(next);
  }

  function deleteCase(id: string) {
    const next = cases.filter(x => x.id !== id);
    setCases(next);
    saveCases(next);
  }

  function newCase() {
    const c: AdminCase = {
      id: Date.now().toString(),
      name: 'New Case',
      price: '0.00',
      houseEdge: DEFAULT_HOUSE_EDGE,
      image: CASE_IMAGES[0],
      skins: [],
      createdAt: new Date().toISOString(),
    };
    setEditing(c);
    setView('builder');
  }

  if (view === 'builder' && editing) {
    return (
      <CaseBuilder
        initial={editing}
        onSave={c => { saveCase(c); setEditing(null); setView('list'); }}
        onBack={() => { setEditing(null); setView('list'); }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div onClick={() => go('home')} style={{ color: '#9aa39a', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>‹ Back to site</div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 24, margin: 0 }}>Admin — Case Builder</h1>
        </div>
        <button onClick={newCase} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a',
          background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 28px', borderRadius: 11, cursor: 'pointer' }}>
          + New Case
        </button>
      </div>

      {cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b746b', fontSize: 14 }}>
          No cases yet. Click <strong style={{ color: '#7fe877' }}>+ New Case</strong> to build one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
          {cases.map(c => {
            const ev = calcEV(c.skins);
            const price = parseFloat(c.price) || 0;
            return (
              <div key={c.id} style={{ background: '#0c0f0b', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <img src={c.image} alt={c.name} style={{ height: 100, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.6))' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#9aa39a', marginBottom: 4 }}>
                  <CoinIcon size={13} />{c.price} · {c.skins.length} skins
                </div>
                <div style={{ fontSize: 11, color: '#6b746b', marginBottom: 10 }}>
                  EV ${ev.toFixed(2)} · Edge {c.houseEdge}%
                  {price > 0 && <span style={{ color: price >= ev ? '#3ad48f' : '#eb4b4b' }}> · RTP {((ev / price) * 100).toFixed(1)}%</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setEditing(c); setView('builder'); }}
                    style={{ flex: 1, background: '#1c241b', border: '1px solid rgba(95,213,95,.2)', borderRadius: 9, padding: '9px 0', color: '#7fe877', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => deleteCase(c.id)}
                    style={{ width: 38, background: '#1a1014', border: '1px solid rgba(235,75,75,.2)', borderRadius: 9, color: '#eb4b4b', fontSize: 15, cursor: 'pointer' }}>
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Case Builder ─────────────────────────────────────────────────────────────

function CaseBuilder({ initial, onSave, onBack }: { initial: AdminCase; onSave: (c: AdminCase) => void; onBack: () => void }) {
  const [draft, setDraft] = useState<AdminCase>(initial);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NormalizedSkin[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');

  // Recompute price whenever skins or houseEdge change
  const ev = useMemo(() => calcEV(draft.skins), [draft.skins]);
  const suggestedPrice = useMemo(() => calcPrice(draft.skins, draft.houseEdge), [draft.skins, draft.houseEdge]);
  const total = useMemo(() => totalChance(draft.skins), [draft.skins]);
  const totalOk = Math.abs(total - 100) < 0.01;

  // Auto-update price when skins/edge change
  useEffect(() => {
    if (draft.skins.length === 0) return;
    setDraft(d => ({ ...d, price: suggestedPrice.toFixed(2) }));
  }, [suggestedPrice]);

  function updateDropChance(id: string, val: number) {
    setDraft(d => ({ ...d, skins: d.skins.map(s => s.id === id ? { ...s, dropChance: val } : s) }));
  }

  function distributeEvenly() {
    if (draft.skins.length === 0) return;
    // Group by rarity, apply CS2-convention weights
    const skins = draft.skins.map(s => ({ ...s, dropChance: RAR_DEFAULT_CHANCE[s.rar] }));
    // Normalize so they sum to exactly 100
    const sum = skins.reduce((a, s) => a + s.dropChance, 0);
    const normalized = skins.map(s => ({ ...s, dropChance: +(s.dropChance / sum * 100).toFixed(4) }));
    // Fix rounding so total == 100 exactly
    const diff = 100 - normalized.reduce((a, s) => a + s.dropChance, 0);
    if (normalized.length) normalized[normalized.length - 1].dropChance += diff;
    setDraft(d => ({ ...d, skins: normalized }));
  }

  function distributeEqual() {
    if (draft.skins.length === 0) return;
    const each = +(100 / draft.skins.length).toFixed(4);
    const skins = draft.skins.map((s, i) => ({
      ...s,
      dropChance: i === draft.skins.length - 1 ? +(100 - each * (draft.skins.length - 1)).toFixed(4) : each,
    }));
    setDraft(d => ({ ...d, skins }));
  }

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchErr('');
    try {
      const qs = new URLSearchParams({ limit: '24', type: 'buy_now', market_hash_name: query });
      const res = await fetch(`/api/listings?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResults(json.data);
    } catch (e) {
      setSearchErr(String(e));
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function addSkin(s: NormalizedSkin) {
    if (draft.skins.some(x => x.id === s.id)) return;
    const rar: Rarity = RAR_MAP[s.rarityName] || 'blue';
    const skin: AdminSkin = {
      id: s.id,
      name: s.name,
      skin: s.skin,
      marketName: s.fullName,
      rar,
      color: RAR[rar].c,
      imageUrl: s.imageUrl,
      price: s.price,
      dropChance: RAR_DEFAULT_CHANCE[rar],
    };
    setDraft(d => {
      const newSkins = [...d.skins, skin];
      // Re-normalize drop chances to sum to 100
      const sum = newSkins.reduce((a, x) => a + x.dropChance, 0);
      return { ...d, skins: newSkins.map(x => ({ ...x, dropChance: +(x.dropChance / sum * 100).toFixed(4) })) };
    });
  }

  function removeSkin(id: string) {
    setDraft(d => {
      const remaining = d.skins.filter(s => s.id !== id);
      if (remaining.length === 0) return { ...d, skins: [] };
      // Re-normalize
      const sum = remaining.reduce((a, s) => a + s.dropChance, 0);
      return { ...d, skins: remaining.map(s => ({ ...s, dropChance: +(s.dropChance / sum * 100).toFixed(4) })) };
    });
  }

  const rtp = suggestedPrice > 0 ? (ev / suggestedPrice) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9aa39a', fontSize: 13, cursor: 'pointer' }}>‹ Back</button>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 22, margin: 0, flex: 1 }}>{draft.name || 'New Case'}</h1>
        <button
          onClick={() => totalOk ? onSave(draft) : null}
          title={totalOk ? '' : 'Drop chances must sum to 100%'}
          style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a',
            background: totalOk ? 'linear-gradient(160deg,#74e36b,#46c041)' : '#2a3a2a',
            border: 'none', padding: '12px 28px', borderRadius: 11,
            cursor: totalOk ? 'pointer' : 'not-allowed', opacity: totalOk ? 1 : 0.5 }}>
          Save Case
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Case metadata */}
          <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <img src={draft.image} alt="case" style={{ height: 100, objectFit: 'contain', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.6))' }} />
            </div>

            <Label>Case Name</Label>
            <Input value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} placeholder="e.g. Pandora Box" />

            <Label>Case Image</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {CASE_IMAGES.map(img => (
                <div key={img} onClick={() => setDraft(d => ({ ...d, image: img }))}
                  style={{ borderRadius: 10, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: draft.image === img ? 'rgba(95,213,95,.14)' : '#0e120e',
                    border: `1px solid ${draft.image === img ? 'rgba(95,213,95,.5)' : 'rgba(255,255,255,.07)'}` }}>
                  <img src={img} style={{ height: 48, objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing math panel */}
          <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#cfd4cf' }}>Case Economics</div>

            {/* House edge */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Label>House Edge</Label>
                <span style={{ fontSize: 12, color: '#7fe877', fontWeight: 700 }}>{draft.houseEdge}%</span>
              </div>
              <input
                type="range" min={1} max={30} step={0.5}
                value={draft.houseEdge}
                onChange={e => setDraft(d => ({ ...d, houseEdge: parseFloat(e.target.value) }))}
                style={{ width: '100%', accentColor: '#46c041' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a7a4a', marginTop: 4 }}>
                <span>1% (player-friendly)</span><span>30% (house-heavy)</span>
              </div>
            </div>

            {/* EV breakdown */}
            <div style={{ background: '#0e120e', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <MathRow label="Expected Value (EV)" value={`$${ev.toFixed(2)}`} />
              <MathRow label="House Edge" value={`${draft.houseEdge}%`} />
              <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 9 }}>
                <MathRow label="Suggested Price" value={`$${suggestedPrice.toFixed(2)}`} highlight />
              </div>
              <MathRow label="RTP (Return to Player)" value={`${rtp.toFixed(1)}%`}
                valueColor={rtp >= 80 ? '#3ad48f' : rtp >= 70 ? '#e6c33e' : '#eb4b4b'} />
              <MathRow label="House profit per open" value={`$${(suggestedPrice - ev).toFixed(2)}`} />
            </div>

            {/* Auto-computed price display */}
            <div style={{ marginTop: 14, background: 'rgba(95,213,95,.08)', border: '1px solid rgba(95,213,95,.3)', borderRadius: 11, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#9aa39a', marginBottom: 4 }}>Case price (auto-calculated)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CoinIcon size={20} />
                <span style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 26, color: '#7fe877' }}>
                  {suggestedPrice > 0 ? suggestedPrice.toFixed(2) : '—'}
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#4a7a4a', marginTop: 4 }}>
                EV ${ev.toFixed(2)} ÷ (1 − {draft.houseEdge}%) = ${suggestedPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Skins in case with drop chance inputs */}
          <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#cfd4cf' }}>
                Skins <span style={{ color: '#7fe877' }}>({draft.skins.length})</span>
              </div>
              {draft.skins.length > 0 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={distributeEvenly}
                    style={{ fontSize: 10, padding: '4px 10px', borderRadius: 7, background: '#1c241b', border: '1px solid rgba(95,213,95,.2)', color: '#7fe877', cursor: 'pointer' }}>
                    CS2 weights
                  </button>
                  <button onClick={distributeEqual}
                    style={{ fontSize: 10, padding: '4px 10px', borderRadius: 7, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', color: '#9aa39a', cursor: 'pointer' }}>
                    Equal
                  </button>
                </div>
              )}
            </div>

            {/* Total drop % indicator */}
            {draft.skins.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px',
                borderRadius: 9, background: totalOk ? 'rgba(58,212,143,.08)' : 'rgba(235,75,75,.08)',
                border: `1px solid ${totalOk ? 'rgba(58,212,143,.25)' : 'rgba(235,75,75,.25)'}` }}>
                <div style={{ flex: 1, height: 4, borderRadius: 3, background: '#1a221a', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(total, 100)}%`, borderRadius: 3,
                    background: totalOk ? '#3ad48f' : total > 100 ? '#eb4b4b' : '#e6c33e', transition: 'width .2s' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: totalOk ? '#3ad48f' : total > 100 ? '#eb4b4b' : '#e6c33e', whiteSpace: 'nowrap' }}>
                  {total.toFixed(2)}% {totalOk ? '✓' : total > 100 ? '↑ over' : '↓ under'}
                </span>
              </div>
            )}

            {draft.skins.length === 0 && (
              <div style={{ fontSize: 12, color: '#6b746b', textAlign: 'center', padding: '16px 0' }}>Search and add skins →</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
              {draft.skins.map(s => (
                <div key={s.id} style={{ background: '#0e120e', border: `1px solid ${s.color}33`, borderRadius: 11, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <SkinImage marketName={s.marketName} imageUrl={s.imageUrl} size={40} glowColor={s.color} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#9aa39a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.skin}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#cfd4cf', fontWeight: 600, marginRight: 4 }}>${s.price.toFixed(2)}</div>
                    <button onClick={() => removeSkin(s.id)}
                      style={{ width: 22, height: 22, borderRadius: 6, background: '#1a1014', border: '1px solid rgba(235,75,75,.2)', color: '#eb4b4b', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  </div>
                  {/* Drop chance input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="range" min={0.01} max={100} step={0.01}
                      value={s.dropChance}
                      onChange={e => updateDropChance(s.id, parseFloat(e.target.value))}
                      style={{ flex: 1, accentColor: s.color }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 72 }}>
                      <input
                        type="number" min={0.01} max={100} step={0.01}
                        value={s.dropChance.toFixed(2)}
                        onChange={e => updateDropChance(s.id, Math.max(0.01, Math.min(100, parseFloat(e.target.value) || 0)))}
                        style={{ width: 56, background: '#141814', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '4px 7px', color: '#e8ece8', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)' }}
                      />
                      <span style={{ fontSize: 11, color: '#6b746b' }}>%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#4a7a4a' }}>
                    <span>EV contribution: ${(s.price * s.dropChance / 100).toFixed(3)}</span>
                    <span style={{ color: s.color }}>{RAR[s.rar].n}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: CSFloat skin search */}
        <div>
          <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Search CSFloat Skins</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. AK-47 | Redline or Karambit"
                style={{ flex: 1, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10,
                  padding: '12px 16px', color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 14, outline: 'none' }}
              />
              <button onClick={search} disabled={searching}
                style={{ fontWeight: 700, fontSize: 14, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)',
                  border: 'none', padding: '0 24px', borderRadius: 10, cursor: 'pointer', opacity: searching ? .6 : 1 }}>
                {searching ? '…' : 'Search'}
              </button>
            </div>
            {searchErr && <div style={{ fontSize: 12, color: '#eb4b4b', marginTop: 8 }}>{searchErr}</div>}
          </div>

          {results.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
              {results.map(s => {
                const already = draft.skins.some(x => x.id === s.id);
                return (
                  <div key={s.id}
                    style={{ position: 'relative', background: '#0b0e0a', border: `1px solid ${already ? 'rgba(95,213,95,.4)' : s.color}`,
                      borderRadius: 12, padding: '12px 10px', cursor: already ? 'default' : 'pointer', overflow: 'hidden',
                      transition: 'transform .12s, box-shadow .12s', opacity: already ? .6 : 1 }}
                    onClick={() => !already && addSkin(s)}
                    onMouseEnter={e => { if (!already) { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(0,0,0,.4)'; }}}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                    {already && (
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 6,
                        background: '#46c041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#06270a', fontWeight: 700 }}>✓</div>
                    )}
                    {s.isStatTrak && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(207,134,34,.9)', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700, color: '#fff' }}>ST</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, margin: '6px 0 8px' }}>
                      <img src={s.imageUrl} alt={s.fullName}
                        style={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.6))' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 10, color: '#9aa39a' }}>{s.name}</div>
                    <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 11, color: s.color, lineHeight: 1.3 }}>{s.skin}</div>
                    <div style={{ textAlign: 'center', fontSize: 10, color: '#6b746b', marginTop: 2 }}>{s.wear}</div>
                    <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12, fontWeight: 700 }}>
                      <span style={{ color: '#3ad48f', fontSize: 10 }}>$</span>{s.priceDisplay}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!searching && results.length === 0 && query && !searchErr && (
            <div style={{ textAlign: 'center', color: '#6b746b', padding: 40, fontSize: 13 }}>No results for "{query}"</div>
          )}

          {results.length === 0 && !query && (
            <div style={{ textAlign: 'center', color: '#4a7a4a', padding: 60, fontSize: 13 }}>
              Search for any CS2 skin by name.<br />
              <span style={{ fontSize: 12, color: '#3a5a3a' }}>Try: "AK-47 Redline", "Karambit", "AWP Dragon Lore"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MathRow({ label, value, highlight, valueColor }: { label: string; value: string; highlight?: boolean; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: highlight ? '#cfd4cf' : '#6b746b' }}>{label}</span>
      <span style={{ fontSize: highlight ? 15 : 12, fontWeight: highlight ? 700 : 600, color: valueColor || (highlight ? '#7fe877' : '#9aa39a') }}>{value}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 6, marginTop: 14 }}>{children}</div>;
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9,
        padding: '10px 14px', color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
  );
}
