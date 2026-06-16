'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { CASE_IMAGES, RAR, Rarity } from '@/app/lib/data';
import { fetchCases, upsertCase, deleteCase as dbDeleteCase, fetchHomeLayout, saveHomeLayout as dbSaveHomeLayout, fetchImageCollections, saveImageCollections, deleteImageCollection, DbCase } from '@/app/lib/db';

// ── Home layout config ────────────────────────────────────────────────────────

export interface HomeSection {
  id: string;
  title: string;
  icon: string;
  caseIds: string[];
}

export const HOME_LAYOUT_KEY = 'sm_home_layout';

export const DEFAULT_HOME_LAYOUT: HomeSection[] = [
  { id: 'section1', title: 'Knives Collection',      icon: '🔪', caseIds: [] },
  { id: 'section2', title: 'Gloves Collection',      icon: '🧤', caseIds: [] },
  { id: 'section3', title: 'Ruby Knifes Collection', icon: '🍁', caseIds: [] },
  { id: 'section4', title: 'Best Sellers',           icon: '⭐', caseIds: [] },
];

function loadHomeLayout(): HomeSection[] {
  try { return JSON.parse(localStorage.getItem(HOME_LAYOUT_KEY) || 'null') || DEFAULT_HOME_LAYOUT; }
  catch { return DEFAULT_HOME_LAYOUT; }
}

function saveHomeLayout(layout: HomeSection[]) {
  localStorage.setItem(HOME_LAYOUT_KEY, JSON.stringify(layout));
}

// ── Image library (collections) ──────────────────────────────────────────────

interface ImageCollection {
  id: string;
  name: string;
  images: string[]; // file path or base64 data URL
}

const LIB_KEY = 'sm_case_image_lib';

const DEFAULT_COLLECTIONS: ImageCollection[] = [
  {
    id: 'classic',
    name: 'Classic Cases',
    images: [...CASE_IMAGES],
  },
];

function loadCollections(): ImageCollection[] {
  try {
    const stored = JSON.parse(localStorage.getItem(LIB_KEY) || 'null');
    return stored || DEFAULT_COLLECTIONS;
  } catch { return DEFAULT_COLLECTIONS; }
}

function saveCollections(cols: ImageCollection[]) {
  localStorage.setItem(LIB_KEY, JSON.stringify(cols));
}

interface SteamSkin {
  id: string;
  name: string;
  skin: string;
  fullName: string;
  wear: string;
  rar: string;
  color: string;
  rarityName: string;
  price: number;
  priceDisplay: string;
  imageUrl: string;
  isStatTrak: boolean;
  listings: number;
}
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

function dbCaseToAdmin(c: DbCase): AdminCase {
  return {
    id: c.id,
    name: c.name,
    price: c.price.toFixed(2),
    houseEdge: c.house_edge,
    image: c.image_url || CASE_IMAGES[0],
    createdAt: c.created_at,
    skins: (c.skins || []).map(s => ({
      id: s.id,
      name: s.name,
      skin: s.skin,
      marketName: s.market_name,
      rar: s.rarity as Rarity,
      color: s.color,
      imageUrl: s.image_url,
      price: s.price,
      dropChance: s.drop_chance,
    })),
  };
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
  const [view, setView] = useState<'list' | 'builder' | 'library' | 'homelayout'>('list');
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [editing, setEditing] = useState<AdminCase | null>(null);
  const [collections, setCollections] = useState<ImageCollection[]>([]);
  const [homeLayout, setHomeLayout] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCases(),
      fetchImageCollections(),
      fetchHomeLayout(),
    ]).then(([dbCases, dbCols, dbLayout]) => {
      setCases(dbCases.map(dbCaseToAdmin));
      setCollections(dbCols.length ? dbCols : loadCollections());
      setHomeLayout(dbLayout.length ? dbLayout.map(s => ({
        id: s.id, title: s.title, icon: s.icon, caseIds: s.case_ids,
      })) : DEFAULT_HOME_LAYOUT);
      setLoading(false);
    });
  }, []);

  async function updateCollections(cols: ImageCollection[]) {
    setCollections(cols);
    saveCollections(cols);
    await saveImageCollections(cols.map(c => ({ id: c.id, name: c.name, images: c.images })));
  }

  async function updateHomeLayout(layout: HomeSection[]) {
    setHomeLayout(layout);
    saveHomeLayout(layout);
    await dbSaveHomeLayout(layout.map(s => ({
      id: s.id, title: s.title, icon: s.icon, case_ids: s.caseIds,
    })));
  }

  async function cacheImage(url: string): Promise<string> {
    if (!url || url.startsWith('/') || url.startsWith('data:')) return url;
    try {
      const res = await fetch('/api/cache-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) return (await res.json()).url || url;
    } catch {}
    return url;
  }

  async function saveCase(c: AdminCase) {
    // Cache all images into Supabase Storage before saving
    const [caseImageUrl, ...skinImageUrls] = await Promise.all([
      cacheImage(c.image),
      ...c.skins.map(s => cacheImage(s.imageUrl)),
    ]);

    const saved = await upsertCase({
      id: c.id,
      name: c.name,
      price: parseFloat(c.price) || 0,
      house_edge: c.houseEdge,
      image_url: caseImageUrl,
      skins: c.skins.map((s, i) => ({
        market_name: s.marketName,
        name: s.name,
        skin: s.skin,
        image_url: skinImageUrls[i],
        rarity: s.rar,
        color: s.color,
        price: s.price,
        drop_chance: s.dropChance,
      })),
    });
    if (saved) {
      const updated = dbCaseToAdmin({ ...saved, skins: c.skins.map((s, i) => ({
        id: s.id, case_id: saved.id, market_name: s.marketName, name: s.name,
        skin: s.skin, image_url: skinImageUrls[i], rarity: s.rar, color: s.color,
        price: s.price, drop_chance: s.dropChance,
      }))});
      setCases(prev => prev.some(x => x.id === saved.id)
        ? prev.map(x => x.id === saved.id ? updated : x)
        : [...prev, updated]);
    }
  }

  async function handleDeleteCase(id: string) {
    await dbDeleteCase(id);
    setCases(prev => prev.filter(x => x.id !== id));
  }

  function newCase() {
    const c: AdminCase = {
      id: crypto.randomUUID(),
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
        collections={collections}
        onSave={async c => { await saveCase(c); setEditing(null); setView('list'); }}
        onBack={() => { setEditing(null); setView('list'); }}
      />
    );
  }

  if (view === 'library') {
    return (
      <LibraryManager
        collections={collections}
        onChange={updateCollections}
        onBack={() => setView('list')}
      />
    );
  }

  if (view === 'homelayout') {
    return (
      <HomeLayoutManager
        layout={homeLayout}
        onChange={updateHomeLayout}
        onBack={() => setView('list')}
        cases={cases}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 24, margin: 0 }}>Case Builder</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setView('homelayout')} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14, color: '#9aa39a',
            background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', padding: '11px 22px', borderRadius: 11, cursor: 'pointer' }}>
            🏠 Home Layout
          </button>
          <button onClick={() => setView('library')} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14, color: '#9aa39a',
            background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', padding: '11px 22px', borderRadius: 11, cursor: 'pointer' }}>
            🗂 Image Library
          </button>
          <button onClick={newCase} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a',
            background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 28px', borderRadius: 11, cursor: 'pointer' }}>
            + New Case
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b746b', fontSize: 14 }}>
          Loading cases…
        </div>
      ) : cases.length === 0 ? (
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
                  <button onClick={() => handleDeleteCase(c.id)}
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

const CAT_TABS = ['All','Rifle','Pistol','Sniper','SMG','Shotgun','Machinegun','Knifes','Gloves'] as const;
const RAR_CHIPS = [
  { key: '',       label: 'All',        color: '#9aa39a' },
  { key: 'gold',   label: '⭐ Gold',    color: '#e6c33e' },
  { key: 'red',    label: 'Covert',     color: '#eb4b4b' },
  { key: 'pink',   label: 'Classified', color: '#d32ce6' },
  { key: 'purple', label: 'Restricted', color: '#8847ff' },
  { key: 'blue',   label: 'Mil-Spec',   color: '#4b69ff' },
];

const PAGE_SIZE = 48;

function CaseBuilder({ initial, collections, onSave, onBack }: { initial: AdminCase; collections: ImageCollection[]; onSave: (c: AdminCase) => void; onBack: () => void }) {
  const [draft, setDraft] = useState<AdminCase>(initial);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [rarFilter, setRarFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<SteamSkin[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [totalAvail, setTotalAvail] = useState(0);

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

  // Reset to page 0 when filters change, then fetch
  useEffect(() => {
    if (query.trim()) return;
    setPage(0);
    doFetch({ pg: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catFilter, rarFilter]);

  // Fetch when page changes (but not on initial mount — handled above)
  const isFirstMount = useState(true);
  useEffect(() => {
    if (isFirstMount[0]) { isFirstMount[1](false); return; }
    doFetch({ pg: page });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function doFetch(opts?: { pg?: number; q?: string }) {
    setSearching(true);
    setSearchErr('');
    const pg = opts?.pg ?? page;
    const q  = opts?.q  ?? query;
    try {
      const qs = new URLSearchParams({ count: String(PAGE_SIZE), start: String(pg * PAGE_SIZE) });
      if (q)           qs.set('q', q);
      if (catFilter)   qs.set('category', catFilter);
      if (rarFilter)   qs.set('rarity', rarFilter);
      if (minPrice)    qs.set('minPrice', minPrice);
      if (maxPrice)    qs.set('maxPrice', maxPrice);
      const res = await fetch(`/api/skin-search?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResults(json.results || []);
      setTotalAvail(json.total || 0);
    } catch (e) {
      setSearchErr(String(e));
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function applyFilters() {
    setPage(0);
    doFetch({ pg: 0 });
  }

  async function search() {
    if (!query.trim() && !catFilter && !rarFilter) return;
    setPage(0);
    doFetch({ pg: 0 });
  }

  const totalPages = Math.ceil(totalAvail / PAGE_SIZE);

  function addSkin(s: SteamSkin) {
    if (draft.skins.some(x => x.id === s.id)) return;
    const rar: Rarity = (RAR_MAP[s.rarityName] || s.rar) as Rarity;
    const skin: AdminSkin = {
      id: s.id,
      name: s.name,
      skin: s.skin,
      marketName: s.fullName,
      rar,
      color: RAR[rar]?.c || s.color,
      imageUrl: s.imageUrl,
      price: s.price,
      dropChance: RAR_DEFAULT_CHANCE[rar] ?? RAR_DEFAULT_CHANCE.blue,
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

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left panel: case metadata + economics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Case metadata */}
          <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <img src={draft.image} alt="case" style={{ height: 100, objectFit: 'contain', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.6))' }} />
            </div>
            <Label>Case Name</Label>
            <Input value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} placeholder="e.g. Pandora Box" />
            <Label>Case Image</Label>
            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {collections.map(col => (
                <div key={col.id}>
                  <div style={{ fontSize: 10, color: '#4a7a4a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7, fontWeight: 600 }}>
                    {col.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                    {col.images.map((img, i) => (
                      <div key={i} onClick={() => setDraft(d => ({ ...d, image: img }))}
                        style={{ borderRadius: 9, padding: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: draft.image === img ? 'rgba(95,213,95,.14)' : '#0e120e',
                          border: `1px solid ${draft.image === img ? 'rgba(95,213,95,.5)' : 'rgba(255,255,255,.07)'}` }}>
                        <img src={img} style={{ height: 44, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                      </div>
                    ))}
                    {col.images.length === 0 && (
                      <div style={{ gridColumn: '1/-1', fontSize: 11, color: '#4a7a4a', textAlign: 'center', padding: '8px 0' }}>
                        No images — add from Image Library
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {collections.length === 0 && (
                <div style={{ fontSize: 12, color: '#4a7a4a', textAlign: 'center', padding: 16 }}>
                  No collections yet. Go to Image Library to create one.
                </div>
              )}
            </div>
          </div>

          {/* Pricing math panel */}
          <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#cfd4cf' }}>Case Economics</div>
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
        </div>

        {/* Right: skin browser */}
        <div>
          {/* Search + filters */}
          <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 18, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#cfd4cf' }}>Browse Steam Market Skins</div>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="Search by name, e.g. AK-47 Redline…"
                style={{ flex: 1, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10,
                  padding: '11px 16px', color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 14, outline: 'none' }}
              />
              <button onClick={search} disabled={searching}
                style={{ fontWeight: 700, fontSize: 14, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)',
                  border: 'none', padding: '0 22px', borderRadius: 10, cursor: 'pointer', opacity: searching ? .6 : 1 }}>
                {searching ? '…' : 'Search'}
              </button>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
              {CAT_TABS.map(cat => {
                const active = catFilter === (cat === 'All' ? '' : cat);
                return (
                  <span key={cat} onClick={() => { setCatFilter(cat === 'All' ? '' : cat); setQuery(''); }}
                    style={{ whiteSpace: 'nowrap', padding: '6px 13px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      background: active ? 'rgba(95,213,95,.14)' : '#0e120e',
                      border: active ? '1px solid rgba(95,213,95,.4)' : '1px solid rgba(255,255,255,.08)',
                      color: active ? '#7fe877' : '#9aa39a' }}>
                    {cat}
                  </span>
                );
              })}
            </div>

            {/* Rarity chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {RAR_CHIPS.map(r => {
                const active = rarFilter === r.key;
                return (
                  <span key={r.key} onClick={() => setRarFilter(r.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      background: active ? `${r.color}22` : '#0e120e',
                      border: active ? `1px solid ${r.color}88` : '1px solid rgba(255,255,255,.08)',
                      color: active ? r.color : '#9aa39a' }}>
                    {r.key && <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flexShrink: 0 }} />}
                    {r.label}
                  </span>
                );
              })}
            </div>

            {/* Price range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9aa39a', whiteSpace: 'nowrap' }}>Price $</span>
              <input
                type="number" min={0} step={1} placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                style={{ width: 80, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8,
                  padding: '7px 10px', color: '#e8ece8', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }}
              />
              <span style={{ color: '#4a7a4a', fontSize: 12 }}>—</span>
              <input
                type="number" min={0} step={1} placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                style={{ width: 80, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8,
                  padding: '7px 10px', color: '#e8ece8', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }}
              />
              <button onClick={applyFilters}
                style={{ padding: '7px 14px', borderRadius: 8, background: '#1c241b', border: '1px solid rgba(95,213,95,.2)', color: '#7fe877', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Apply
              </button>
              {(minPrice || maxPrice) && (
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(0); doFetch({ pg: 0 }); }}
                  style={{ padding: '7px 10px', borderRadius: 8, background: '#1a1014', border: '1px solid rgba(235,75,75,.2)', color: '#eb4b4b', fontSize: 12, cursor: 'pointer' }}>
                  ✕
                </button>
              )}
            </div>

            {searchErr && <div style={{ fontSize: 12, color: '#eb4b4b', marginTop: 10 }}>{searchErr}</div>}
            {!searching && totalAvail > 0 && (
              <div style={{ fontSize: 11, color: '#4a7a4a', marginTop: 10 }}>
                {totalAvail.toLocaleString()} results · page {page + 1} of {totalPages} · showing {results.length}
              </div>
            )}
          </div>

          {searching && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ height: 200, borderRadius: 12, background: '#0b0e0a', border: '1px solid rgba(255,255,255,.05)', animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          {!searching && results.length > 0 && (
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ textAlign: 'center', fontSize: 10, color: '#6b746b' }}>{s.wear}</span>
                      {s.listings > 0 && <span style={{ fontSize: 9, color: '#4a7a4a' }}>{s.listings.toLocaleString()} listed</span>}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12, fontWeight: 700 }}>
                      <span style={{ color: '#3ad48f', fontSize: 10 }}>$</span>{s.priceDisplay}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!searching && results.length === 0 && !searchErr && (
            <div style={{ textAlign: 'center', color: '#4a7a4a', padding: 40, fontSize: 13 }}>
              {query ? `No results for "${query}"` : 'Select a category or search by name above'}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !searching && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
              <button onClick={() => setPage(0)} disabled={page === 0}
                style={pageBtnStyle(false, page === 0)}>«</button>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                style={pageBtnStyle(false, page === 0)}>‹</button>

              {pageNumbers(page, totalPages).map((p, i) =>
                p === '…'
                  ? <span key={`ellipsis-${i}`} style={{ color: '#4a7a4a', fontSize: 13, padding: '0 4px' }}>…</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                      style={pageBtnStyle(p === page, false)}>{(p as number) + 1}</button>
              )}

              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                style={pageBtnStyle(false, page >= totalPages - 1)}>›</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
                style={pageBtnStyle(false, page >= totalPages - 1)}>»</button>
            </div>
          )}

          {/* ── Skins in case ── */}
          <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#cfd4cf' }}>
                Skins in Case <span style={{ color: '#7fe877' }}>({draft.skins.length})</span>
              </div>
              {draft.skins.length > 0 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={distributeEvenly}
                    style={{ fontSize: 11, padding: '5px 12px', borderRadius: 7, background: '#1c241b', border: '1px solid rgba(95,213,95,.2)', color: '#7fe877', cursor: 'pointer' }}>
                    CS2 weights
                  </button>
                  <button onClick={distributeEqual}
                    style={{ fontSize: 11, padding: '5px 12px', borderRadius: 7, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', color: '#9aa39a', cursor: 'pointer' }}>
                    Equal split
                  </button>
                </div>
              )}
            </div>

            {/* Total drop % bar */}
            {draft.skins.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '9px 14px',
                borderRadius: 10, background: totalOk ? 'rgba(58,212,143,.08)' : 'rgba(235,75,75,.08)',
                border: `1px solid ${totalOk ? 'rgba(58,212,143,.25)' : 'rgba(235,75,75,.25)'}` }}>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#1a221a', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(total, 100)}%`, borderRadius: 3,
                    background: totalOk ? '#3ad48f' : total > 100 ? '#eb4b4b' : '#e6c33e', transition: 'width .2s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: totalOk ? '#3ad48f' : total > 100 ? '#eb4b4b' : '#e6c33e', whiteSpace: 'nowrap' }}>
                  {total.toFixed(2)}% {totalOk ? '✓' : total > 100 ? '↑ over 100%' : '↓ under 100%'}
                </span>
              </div>
            )}

            {draft.skins.length === 0 && (
              <div style={{ fontSize: 13, color: '#4a7a4a', textAlign: 'center', padding: '24px 0' }}>
                Click a skin above to add it to the case
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
              {draft.skins.map(s => (
                <div key={s.id} style={{ background: '#0e120e', border: `1px solid ${s.color}33`, borderRadius: 11, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <SkinImage marketName={s.marketName} imageUrl={s.imageUrl} size={48} glowColor={s.color} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#9aa39a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.skin}</div>
                      <div style={{ fontSize: 11, color: '#6b746b' }}>{RAR[s.rar].n}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, color: '#cfd4cf', fontWeight: 700 }}>${s.price.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: '#4a7a4a', marginTop: 2 }}>
                        EV ${(s.price * s.dropChance / 100).toFixed(3)}
                      </div>
                    </div>
                    <button onClick={() => removeSkin(s.id)}
                      style={{ width: 26, height: 26, borderRadius: 7, background: '#1a1014', border: '1px solid rgba(235,75,75,.2)', color: '#eb4b4b', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="range" min={0.01} max={100} step={0.01}
                      value={s.dropChance}
                      onChange={e => updateDropChance(s.id, parseFloat(e.target.value))}
                      style={{ flex: 1, accentColor: s.color }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <input
                        type="number" min={0.01} max={100} step={0.01}
                        value={s.dropChance.toFixed(2)}
                        onChange={e => updateDropChance(s.id, Math.max(0.01, Math.min(100, parseFloat(e.target.value) || 0)))}
                        style={{ width: 60, background: '#141814', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '5px 8px', color: '#e8ece8', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)' }}
                      />
                      <span style={{ fontSize: 11, color: '#6b746b' }}>%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Home Layout Manager ───────────────────────────────────────────────────────

function HomeLayoutManager({ layout, onChange, onBack, cases: allCases }: {
  layout: HomeSection[];
  onChange: (l: HomeSection[]) => void;
  onBack: () => void;
  cases: AdminCase[];
}) {
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateSection(id: string, patch: Partial<HomeSection>) {
    onChange(layout.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function toggleCase(sectionId: string, caseId: string) {
    const section = layout.find(s => s.id === sectionId)!;
    const has = section.caseIds.includes(caseId);
    const next = has
      ? section.caseIds.filter(x => x !== caseId)
      : section.caseIds.length < 5
        ? [...section.caseIds, caseId]
        : section.caseIds;
    updateSection(sectionId, { caseIds: next });
  }

  function handleSave() {
    onChange(layout);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetSection(id: string) {
    const def = DEFAULT_HOME_LAYOUT.find(s => s.id === id);
    if (def) updateSection(id, { ...def });
  }

  const SECTION_LABELS = ['1st', '2nd', '3rd', '4th'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9aa39a', fontSize: 13, cursor: 'pointer' }}>‹ Back</button>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 22, margin: 0, flex: 1 }}>Home Layout</h1>
        <button onClick={handleSave}
          style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14,
            color: saved ? '#3ad48f' : '#06270a',
            background: saved ? 'rgba(58,212,143,.15)' : 'linear-gradient(160deg,#74e36b,#46c041)',
            border: saved ? '1px solid rgba(58,212,143,.4)' : 'none',
            padding: '11px 26px', borderRadius: 11, cursor: 'pointer', transition: 'all .2s' }}>
          {saved ? '✓ Saved' : 'Save Layout'}
        </button>
      </div>

      <div style={{ fontSize: 13, color: '#6b746b', marginBottom: 20, padding: '10px 16px',
        background: '#0b0e0a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10 }}>
        Configure which cases appear in each of the 4 homepage sections. Each section shows up to 5 cases.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {layout.map((section, idx) => (
          <div key={section.id} style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ background: 'rgba(95,213,95,.12)', border: '1px solid rgba(95,213,95,.2)',
                borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#7fe877', whiteSpace: 'nowrap' }}>
                {SECTION_LABELS[idx]} Section
              </div>
              <input
                value={section.icon}
                onChange={e => updateSection(section.id, { icon: e.target.value })}
                style={{ width: 40, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 8, padding: '7px', color: '#e8ece8', fontSize: 16, outline: 'none', textAlign: 'center' }}
              />
              <input
                value={section.title}
                onChange={e => updateSection(section.id, { title: e.target.value })}
                style={{ flex: 1, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 9, padding: '9px 14px', color: '#e8ece8', fontFamily: 'var(--font-poppins)',
                  fontWeight: 700, fontSize: 15, outline: 'none' }}
              />
              <span style={{ fontSize: 12, color: '#4a7a4a', whiteSpace: 'nowrap' }}>
                {section.caseIds.length}/5 cases
              </span>
              <button onClick={() => resetSection(section.id)}
                style={{ padding: '6px 12px', borderRadius: 8, background: '#0e120e',
                  border: '1px solid rgba(255,255,255,.08)', color: '#6b746b', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Reset
              </button>
            </div>

            {/* Selected cases preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 14 }}>
              {section.caseIds.map(cid => {
                const c = allCases.find(x => x.id === cid);
                if (!c) return null;
                return (
                  <div key={cid} style={{ position: 'relative', background: '#0e120e',
                    border: '1px solid rgba(95,213,95,.25)', borderRadius: 11, padding: 10, textAlign: 'center' }}>
                    <img src={c.image} alt={c.name} style={{ height: 60, objectFit: 'contain',
                      filter: 'drop-shadow(0 3px 8px rgba(0,0,0,.6))', marginBottom: 6 }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                    <div style={{ fontSize: 10, color: '#cfd4cf', fontWeight: 600, lineHeight: 1.3 }}>{c.name}</div>
                    <button onClick={() => toggleCase(section.id, cid)}
                      style={{ position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: 5,
                        background: 'rgba(26,16,20,.9)', border: '1px solid rgba(235,75,75,.3)',
                        color: '#eb4b4b', fontSize: 10, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>✕</button>
                  </div>
                );
              })}
              {section.caseIds.length < 5 && (
                <div
                  onClick={() => setPickingFor(pickingFor === section.id ? null : section.id)}
                  style={{ border: '2px dashed rgba(95,213,95,.2)', borderRadius: 11, padding: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                    gap: 4, cursor: 'pointer', color: '#4a7a4a', fontSize: 12,
                    background: pickingFor === section.id ? 'rgba(95,213,95,.06)' : 'transparent' }}>
                  <span style={{ fontSize: 20 }}>+</span>
                  <span>Add case</span>
                </div>
              )}
            </div>

            {/* Case picker (expanded) */}
            {pickingFor === section.id && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14 }}>
                <div style={{ fontSize: 11, color: '#4a7a4a', marginBottom: 10 }}>
                  Click a case to add it to this section
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {allCases.map(c => {
                    const selected = section.caseIds.includes(c.id);
                    return (
                      <div key={c.id}
                        onClick={() => !selected && toggleCase(section.id, c.id)}
                        style={{ background: selected ? 'rgba(95,213,95,.1)' : '#0e120e',
                          border: `1px solid ${selected ? 'rgba(95,213,95,.4)' : 'rgba(255,255,255,.06)'}`,
                          borderRadius: 9, padding: 8, textAlign: 'center', cursor: selected ? 'default' : 'pointer',
                          opacity: selected ? 0.55 : 1, transition: 'all .12s' }}>
                        <img src={c.image} alt={c.name}
                          style={{ height: 48, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.5))' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                        <div style={{ fontSize: 9, color: '#9aa39a', marginTop: 4, lineHeight: 1.3 }}>{c.name}</div>
                        {selected && <div style={{ fontSize: 9, color: '#7fe877', fontWeight: 700 }}>✓ Added</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Library Manager ──────────────────────────────────────────────────────────

function LibraryManager({ collections, onChange, onBack }: {
  collections: ImageCollection[];
  onChange: (cols: ImageCollection[]) => void;
  onBack: () => void;
}) {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function addCollection() {
    if (!newName.trim()) return;
    const col: ImageCollection = { id: Date.now().toString(), name: newName.trim(), images: [] };
    onChange([...collections, col]);
    setNewName('');
  }

  function deleteCollection(id: string) {
    onChange(collections.filter(c => c.id !== id));
  }

  function renameCollection(id: string, name: string) {
    onChange(collections.map(c => c.id === id ? { ...c, name } : c));
  }

  function removeImage(colId: string, idx: number) {
    onChange(collections.map(c => c.id === colId ? { ...c, images: c.images.filter((_, i) => i !== idx) } : c));
  }

  function handleFiles(colId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(file => new Promise<string>(resolve => {
      const r = new FileReader();
      r.onload = e => resolve(e.target?.result as string);
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(urls => {
      onChange(collections.map(c => c.id === colId ? { ...c, images: [...c.images, ...urls] } : c));
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9aa39a', fontSize: 13, cursor: 'pointer' }}>‹ Back</button>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 22, margin: 0, flex: 1 }}>Image Library</h1>
      </div>

      {/* Create collection */}
      <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 18, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#cfd4cf', marginBottom: 12 }}>New Collection</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCollection()}
            placeholder="Collection name, e.g. Knife Cases"
            style={{ flex: 1, background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9,
              padding: '10px 14px', color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 13, outline: 'none' }}
          />
          <button onClick={addCollection}
            style={{ fontWeight: 700, fontSize: 14, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)',
              border: 'none', padding: '0 22px', borderRadius: 10, cursor: 'pointer' }}>
            + Create
          </button>
        </div>
      </div>

      {collections.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b746b', fontSize: 13 }}>
          No collections yet. Create one above.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {collections.map(col => (
          <div key={col.id} style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20 }}>
            {/* Collection header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <input
                value={editingName[col.id] ?? col.name}
                onChange={e => setEditingName(n => ({ ...n, [col.id]: e.target.value }))}
                onBlur={() => {
                  const name = editingName[col.id];
                  if (name !== undefined && name.trim()) renameCollection(col.id, name.trim());
                  setEditingName(n => { const copy = { ...n }; delete copy[col.id]; return copy; });
                }}
                style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.1)',
                  color: '#e8ece8', fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 16, outline: 'none', padding: '4px 0' }}
              />
              <span style={{ fontSize: 12, color: '#4a7a4a' }}>{col.images.length} image{col.images.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => fileRefs.current[col.id]?.click()}
                style={{ padding: '7px 16px', borderRadius: 9, background: '#1c241b', border: '1px solid rgba(95,213,95,.25)',
                  color: '#7fe877', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Upload Images
              </button>
              <input
                ref={el => { fileRefs.current[col.id] = el; }}
                type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => handleFiles(col.id, e.target.files)}
              />
              {col.id !== 'classic' && (
                <button onClick={() => deleteCollection(col.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, background: '#1a1014', border: '1px solid rgba(235,75,75,.2)',
                    color: '#eb4b4b', fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>
                  🗑
                </button>
              )}
            </div>

            {/* Image grid */}
            {col.images.length === 0 ? (
              <div
                onClick={() => fileRefs.current[col.id]?.click()}
                style={{ border: '2px dashed rgba(255,255,255,.08)', borderRadius: 12, padding: '32px 0',
                  textAlign: 'center', color: '#4a7a4a', fontSize: 13, cursor: 'pointer' }}>
                Click "+ Upload Images" or drop images here
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
                {col.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', background: '#0e120e', border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={img} style={{ height: 80, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.6))' }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                    <button
                      onClick={() => removeImage(col.id, idx)}
                      style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 6,
                        background: 'rgba(26,16,20,.9)', border: '1px solid rgba(235,75,75,.3)', color: '#eb4b4b',
                        fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function pageBtnStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    minWidth: 36, height: 36, borderRadius: 9, border: active ? '1px solid rgba(95,213,95,.5)' : '1px solid rgba(255,255,255,.08)',
    background: active ? 'rgba(95,213,95,.14)' : '#0e120e', color: active ? '#7fe877' : disabled ? '#2a3a2a' : '#9aa39a',
    fontSize: 13, fontWeight: active ? 700 : 400, cursor: disabled ? 'default' : 'pointer', padding: '0 8px',
  };
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '…')[] = [];
  const addPage = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  addPage(0);
  if (current > 3) pages.push('…');
  for (let i = Math.max(1, current - 2); i <= Math.min(total - 2, current + 2); i++) addPage(i);
  if (current < total - 4) pages.push('…');
  addPage(total - 1);
  return pages;
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
