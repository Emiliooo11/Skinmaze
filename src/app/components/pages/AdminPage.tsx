'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { CASE_IMAGES, RAR, Rarity } from '@/app/lib/data';
import { usdToCoins, fmtCoins } from '@/app/lib/currency';
import { fetchCases, upsertCase, deleteCase as dbDeleteCase, fetchHomeLayout, saveHomeLayout as dbSaveHomeLayout, fetchImageCollections, saveImageCollections, deleteImageCollection, DbCase, fetchDashboardStats, DashboardStats, fetchPlayers, DbPlayer, upsertPlayer, deletePlayer, fetchAffiliates, DbAffiliate, upsertAffiliate, deleteAffiliate, fetchReferralCodes, DbReferralCode, createReferralCode, deleteReferralCode, fetchAllReferralUses, fetchWagers, DbWager } from '@/app/lib/db';
import { SkinImage } from '../SkinImage';
import { CoinIcon } from '../CoinIcon';

// == Home layout config ==

export interface HomeSection {
  id: string;
  title: string;
  icon: string;
  caseIds: string[];
}

export const HOME_LAYOUT_KEY = 'sm_home_layout';

export const DEFAULT_HOME_LAYOUT: HomeSection[] = [
  { id: 'section1', title: 'Knives Collection',      icon: 'knife',  caseIds: [] },
  { id: 'section2', title: 'Gloves Collection',      icon: 'gloves', caseIds: [] },
  { id: 'section3', title: 'Ruby Knifes Collection', icon: 'ruby',   caseIds: [] },
  { id: 'section4', title: 'Best Sellers',           icon: 'star',   caseIds: [] },
];

function loadHomeLayout(): HomeSection[] {
  try { return JSON.parse(localStorage.getItem(HOME_LAYOUT_KEY) || 'null') || DEFAULT_HOME_LAYOUT; }
  catch { return DEFAULT_HOME_LAYOUT; }
}

function saveHomeLayout(layout: HomeSection[]) {
  localStorage.setItem(HOME_LAYOUT_KEY, JSON.stringify(layout));
}

interface ImageCollection { id: string; name: string; images: string[]; }

const LIB_KEY = 'sm_case_image_lib';
const DEFAULT_COLLECTIONS: ImageCollection[] = [{ id: 'classic', name: 'Classic Cases', images: [...CASE_IMAGES] }];

function loadCollections(): ImageCollection[] {
  try { const s = JSON.parse(localStorage.getItem(LIB_KEY) || 'null'); return s || DEFAULT_COLLECTIONS; } catch { return DEFAULT_COLLECTIONS; }
}
function saveCollections(cols: ImageCollection[]) { localStorage.setItem(LIB_KEY, JSON.stringify(cols)); }

interface SteamSkin {
  id: string; name: string; skin: string; fullName: string; wear: string; rar: string;
  color: string; rarityName: string; price: number; priceDisplay: string;
  imageUrl: string; isStatTrak: boolean; listings: number;
}

const DEFAULT_HOUSE_EDGE = 9;

interface AdminSkin {
  id: string; name: string; skin: string; marketName: string; rar: Rarity;
  color: string; imageUrl: string; price: number; dropChance: number;
}

interface AdminCase {
  id: string; name: string; price: string; houseEdge: number;
  image: string; skins: AdminSkin[]; createdAt: string;
}

function dbCaseToAdmin(c: DbCase): AdminCase {
  return {
    id: c.id, name: c.name, price: c.price.toFixed(2), houseEdge: c.house_edge,
    image: c.image_url || CASE_IMAGES[0], createdAt: c.created_at,
    skins: (c.skins || []).map(s => ({
      id: s.id, name: s.name, skin: s.skin, marketName: s.market_name,
      rar: s.rarity as Rarity, color: s.color, imageUrl: s.image_url, price: s.price, dropChance: s.drop_chance,
    })),
  };
}

function calcEV(skins: AdminSkin[]): number { return skins.reduce((sum, s) => sum + s.price * (s.dropChance / 100), 0); }
function calcPrice(skins: AdminSkin[], houseEdge: number): number { const ev = calcEV(skins); if (ev <= 0) return 0; return ev / (1 - houseEdge / 100); }
function totalChance(skins: AdminSkin[]): number { return skins.reduce((sum, s) => sum + s.dropChance, 0); }

const RAR_MAP: Record<string, Rarity> = {
  'Consumer Grade': 'blue', 'Industrial Grade': 'blue', 'Mil-Spec Grade': 'blue',
  'Restricted': 'purple', 'Classified': 'pink', 'Covert': 'red',
  'Extraordinary': 'gold', 'Exceedingly Rare ★': 'gold',
  'High Grade': 'blue', 'Remarkable': 'purple', 'Exotic': 'pink', 'Contraband': 'gold',
};
const RAR_DEFAULT_CHANCE: Record<Rarity, number> = { gold: 0.26, red: 0.64, pink: 3.2, purple: 15.98, blue: 79.92 };

// == Design tokens ==
const C = {
  pageBg: '#f5f6fa', card: '#ffffff', sidebar: '#1a1d23', border: '#e5e7eb',
  primary: '#111827', secondary: '#6b7280', muted: '#9ca3af', accent: '#2563eb',
  success: '#16a34a', danger: '#dc2626', warning: '#d97706',
};
const cardStyle: React.CSSProperties = {
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.08)',
};
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 8,
  padding: '9px 12px', color: C.primary, fontFamily: 'var(--font-funnel)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary'|'secondary'|'danger'|'ghost';
  size?: 'sm'|'md'; disabled?: boolean; style?: React.CSSProperties;
}) {
  const bg: Record<string,string> = { primary: C.accent, secondary: '#fff', danger: '#fef2f2', ghost: 'transparent' };
  const col: Record<string,string> = { primary: '#fff', secondary: C.primary, danger: C.danger, ghost: C.secondary };
  const bdr: Record<string,string> = { primary: C.accent, secondary: C.border, danger: '#fecaca', ghost: 'transparent' };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: bg[variant], color: col[variant], border: `1px solid ${bdr[variant]}`, borderRadius: 8,
        padding: size === 'sm' ? '5px 10px' : '9px 18px', fontSize: size === 'sm' ? 12 : 13, fontWeight: 600,
        fontFamily: 'var(--font-funnel)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        whiteSpace: 'nowrap' as const, ...style }}>
      {children}
    </button>
  );
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: C.secondary, marginBottom: 5, marginTop: 12, fontWeight: 500 }}>{children}</div>;
}
function FormInput({ value, onChange, placeholder, type }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input value={value} type={type} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}

// == SVG Icons ==
function IconDashboard() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconCases() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14M5 8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v.5a2 2 0 0 1-2 2M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/></svg>; }
function IconPlayers() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>; }
function IconLayout() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>; }
function IconAffiliates() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }
function IconBack() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>; }
function IconTrash() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>; }
function IconSearch() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function IconPlus() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>; }
function IconCheck() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>; }
function IconCopy() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function IconX() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>; }
function IconImage() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>; }

// == Main AdminPage ==
export function AdminPage() {
  const [section, setSection] = useState<'dashboard'|'cases'|'players'|'homelayout'|'affiliates'>('dashboard');
  const [view, setView] = useState<'list'|'builder'|'library'>('list');
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [editing, setEditing] = useState<AdminCase | null>(null);
  const [collections, setCollections] = useState<ImageCollection[]>([]);
  const [homeLayout, setHomeLayout] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [players, setPlayers] = useState<DbPlayer[]>([]);
  const [affiliates, setAffiliates] = useState<DbAffiliate[]>([]);
  const [wagers, setWagers] = useState<DbWager[]>([]);

  useEffect(() => {
    Promise.all([fetchCases(), fetchImageCollections(), fetchHomeLayout(), fetchDashboardStats(), fetchPlayers(), fetchAffiliates(), fetchWagers(50)])
      .then(([dbCases, dbCols, dbLayout, dbStats, dbPlayers, dbAffiliates, dbWagers]) => {
        setCases(dbCases.map(dbCaseToAdmin));
        setCollections(dbCols.length ? dbCols : loadCollections());
        setHomeLayout(dbLayout.length ? dbLayout.map(s => ({ id: s.id, title: s.title, icon: s.icon, caseIds: s.case_ids })) : DEFAULT_HOME_LAYOUT);
        setStats(dbStats); setPlayers(dbPlayers); setAffiliates(dbAffiliates); setWagers(dbWagers); setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function updateCollections(cols: ImageCollection[]) {
    setCollections(cols); saveCollections(cols);
    await saveImageCollections(cols.map(c => ({ id: c.id, name: c.name, images: c.images })));
  }
  async function updateHomeLayout(layout: HomeSection[]) {
    setHomeLayout(layout); saveHomeLayout(layout);
    await dbSaveHomeLayout(layout.map(s => ({ id: s.id, title: s.title, icon: s.icon, case_ids: s.caseIds })));
  }
  async function cacheImage(url: string): Promise<string> {
    if (!url || url.startsWith('/') || url.startsWith('data:')) return url;
    try { const res = await fetch('/api/cache-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }); if (res.ok) return (await res.json()).url || url; } catch {}
    return url;
  }
  async function saveCase(c: AdminCase) {
    const [caseImageUrl, ...skinImageUrls] = await Promise.all([cacheImage(c.image), ...c.skins.map(s => cacheImage(s.imageUrl))]);
    const saved = await upsertCase({
      id: c.id, name: c.name, price: parseFloat(c.price) || 0, house_edge: c.houseEdge, image_url: caseImageUrl,
      skins: c.skins.map((s, i) => ({ market_name: s.marketName, name: s.name, skin: s.skin, image_url: skinImageUrls[i], rarity: s.rar, color: s.color, price: s.price, drop_chance: s.dropChance })),
    });
    if (saved) {
      const updated = dbCaseToAdmin({ ...saved, skins: c.skins.map((s, i) => ({ id: s.id, case_id: saved.id, market_name: s.marketName, name: s.name, skin: s.skin, image_url: skinImageUrls[i], rarity: s.rar, color: s.color, price: s.price, drop_chance: s.dropChance })) });
      setCases(prev => prev.some(x => x.id === saved.id) ? prev.map(x => x.id === saved.id ? updated : x) : [...prev, updated]);
    }
  }
  async function handleDeleteCase(id: string) { await dbDeleteCase(id); setCases(prev => prev.filter(x => x.id !== id)); }
  function newCase() {
    const c: AdminCase = { id: crypto.randomUUID(), name: 'New Case', price: '0.00', houseEdge: DEFAULT_HOUSE_EDGE, image: CASE_IMAGES[0], skins: [], createdAt: new Date().toISOString() };
    setEditing(c); setView('builder');
  }

  if (view === 'builder' && editing) {
    return (
      <AdminShell section={section} onSection={s => { setSection(s); setView('list'); }}>
        <CaseBuilder initial={editing} collections={collections} onSave={async c => { await saveCase(c); setEditing(null); setView('list'); }} onBack={() => { setEditing(null); setView('list'); }} />
      </AdminShell>
    );
  }
  if (view === 'library') {
    return (
      <AdminShell section={section} onSection={s => { setSection(s); setView('list'); }}>
        <LibraryManager collections={collections} onChange={updateCollections} onBack={() => setView('list')} />
      </AdminShell>
    );
  }

  function renderContent() {
    if (loading) return <div style={{ textAlign: 'center', padding: 80, color: C.muted, fontSize: 14, fontFamily: 'var(--font-funnel)' }}>Loading...</div>;
    if (section === 'dashboard') return <DashboardSection stats={stats} cases={cases} players={players} wagers={wagers} />;
    if (section === 'cases') return <CasesSection cases={cases} onNew={newCase} onEdit={c => { setEditing(c); setView('builder'); }} onDelete={handleDeleteCase} onLibrary={() => setView('library')} />;
    if (section === 'players') return (
      <PlayersSection players={players}
        onUpdate={async p => { const saved = await upsertPlayer(p); if (saved) setPlayers(prev => prev.some(x => x.id === saved.id) ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]); }}
        onDelete={async id => { await deletePlayer(id); setPlayers(prev => prev.filter(x => x.id !== id)); }} />
    );
    if (section === 'homelayout') return <HomeLayoutManager layout={homeLayout} onChange={updateHomeLayout} onBack={() => setSection('cases')} cases={cases} />;
    if (section === 'affiliates') return (
      <AffiliatesSection affiliates={affiliates}
        onUpdate={async a => { const saved = await upsertAffiliate(a); if (saved) setAffiliates(prev => prev.some(x => x.id === saved.id) ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]); }}
        onDelete={async id => { await deleteAffiliate(id); setAffiliates(prev => prev.filter(x => x.id !== id)); }} />
    );
    return null;
  }
  return <AdminShell section={section} onSection={s => { setSection(s); setView('list'); }}>{renderContent()}</AdminShell>;
}

// == AdminShell ==
type AdminSection = 'dashboard'|'cases'|'players'|'homelayout'|'affiliates';
const NAV_ITEMS: { id: AdminSection; label: string; Icon: React.FC }[] = [
  { id: 'dashboard',  label: 'Dashboard',   Icon: IconDashboard },
  { id: 'cases',      label: 'Cases',       Icon: IconCases },
  { id: 'players',    label: 'Players',     Icon: IconPlayers },
  { id: 'homelayout', label: 'Home Layout', Icon: IconLayout },
  { id: 'affiliates', label: 'Affiliates',  Icon: IconAffiliates },
];

function AdminShell({ section, onSection, children }: { section: AdminSection; onSection: (s: AdminSection) => void; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.pageBg, fontFamily: 'var(--font-funnel)' }}>
      <div style={{ width: 220, flexShrink: 0, background: C.sidebar, display: 'flex', flexDirection: 'column', padding: '24px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', letterSpacing: 1.5, textTransform: 'uppercase', padding: '0 8px', marginBottom: 20 }}>Admin Portal</div>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = section === id;
          return (
            <button key={id} onClick={() => onSection(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                background: active ? C.accent : 'transparent', color: active ? '#fff' : '#9ca3af',
                fontFamily: 'var(--font-funnel)', fontWeight: active ? 600 : 400, fontSize: 14, marginBottom: 2 }}>
              <Icon />{label}
            </button>
          );
        })}
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', fontSize: 13, color: '#6b7280', textDecoration: 'none', borderRadius: 8 }}>
            <IconBack /> Back to site
          </a>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', maxHeight: '100vh' }}>{children}</div>
    </div>
  );
}

function PageHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
      <h1 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 22, margin: 0, color: C.primary }}>{title}</h1>
      {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string|number; sub?: string; accent?: string }) {
  return (
    <div style={{ ...cardStyle, padding: '20px 22px' }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 26, color: accent || C.primary, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}
    </div>
  );
}

// == Case Price Health ==
interface HealthRow {
  id: string; name: string; storedPrice: number; storedHouseEdge: number;
  currentEv: number; suggestedPrice: number; currentHouseEdge: number;
  drift: number; status: 'ok' | 'warning' | 'critical'; skinsChecked: number; skinsFailed: number;
}

function CasePriceHealth() {
  const [rows, setRows] = useState<HealthRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [repricing, setRepricing] = useState<string | null>(null);

  async function runCheck() {
    setLoading(true);
    try {
      const res = await fetch('/api/case-price-health');
      const json = await res.json();
      setRows(json.results ?? []);
      setCheckedAt(json.checkedAt ?? null);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function reprice(row: HealthRow) {
    setRepricing(row.id);
    try {
      await fetch('/api/case-reprice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, price: row.suggestedPrice }),
      });
      setRows(prev => prev.map(r => r.id === row.id
        ? { ...r, storedPrice: row.suggestedPrice, currentHouseEdge: row.storedHouseEdge, drift: 0, status: 'ok' }
        : r));
    } catch { /* ignore */ }
    setRepricing(null);
  }

  const critical = rows.filter(r => r.status === 'critical').length;
  const warning  = rows.filter(r => r.status === 'warning').length;

  return (
    <div style={{ ...cardStyle, padding: 24, marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 15, margin: '0 0 4px', color: C.primary }}>Case Price Health</h3>
          {checkedAt && <div style={{ fontSize: 11, color: C.muted }}>Last checked {new Date(checkedAt).toLocaleString()}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {critical > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: C.danger, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '3px 10px' }}>{critical} critical</span>}
          {warning  > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: C.warning, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: '3px 10px' }}>{warning} warning</span>}
          <Btn onClick={runCheck} disabled={loading}>{loading ? 'Checking…' : rows.length ? 'Re-check' : 'Check Prices'}</Btn>
        </div>
      </div>

      {!rows.length && !loading && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted, fontSize: 13 }}>
          Click <strong>Check Prices</strong> to fetch current Steam Market prices for all active cases and detect any house-edge drift.
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted, fontSize: 13 }}>
          Fetching live Steam prices for all skins… this may take a moment.
        </div>
      )}

      {rows.length > 0 && !loading && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{['Case','Stored Price','Current EV','House Edge','Price Drift','Status',''].map(h =>
              <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: C.muted, fontWeight: 600,
                fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.7, borderBottom: `1px solid ${C.border}` }}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const statusColor = row.status === 'critical' ? C.danger : row.status === 'warning' ? C.warning : C.success;
              const statusBg    = row.status === 'critical' ? '#fef2f2' : row.status === 'warning' ? '#fffbeb' : '#f0fdf4';
              const statusBdr   = row.status === 'critical' ? '#fecaca' : row.status === 'warning' ? '#fde68a' : '#bbf7d0';
              const driftColor  = row.drift > 5 ? C.danger : row.drift < -5 ? C.success : C.secondary;
              return (
                <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 10px', fontWeight: 600, color: C.primary }}>{row.name}</td>
                  <td style={{ padding: '10px 10px', color: C.secondary }}>${row.storedPrice.toFixed(2)}</td>
                  <td style={{ padding: '10px 10px', color: C.secondary }}>${row.currentEv.toFixed(2)}{row.skinsFailed > 0 && <span style={{ fontSize: 10, color: C.muted, marginLeft: 4 }}>({row.skinsFailed} failed)</span>}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ fontWeight: 700, color: row.currentHouseEdge < 0 ? C.danger : row.currentHouseEdge < 5 ? C.warning : C.success }}>
                      {row.currentHouseEdge.toFixed(1)}%
                    </span>
                    <span style={{ color: C.muted, fontSize: 11, marginLeft: 4 }}>/ target {row.storedHouseEdge}%</span>
                  </td>
                  <td style={{ padding: '10px 10px', color: driftColor, fontWeight: 600 }}>
                    {row.drift > 0 ? '+' : ''}{row.drift.toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: statusBg,
                      border: `1px solid ${statusBdr}`, borderRadius: 20, padding: '3px 10px', textTransform: 'uppercase' }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    {row.status !== 'ok' && (
                      <Btn size="sm" variant={row.status === 'critical' ? 'danger' : 'secondary'}
                        disabled={repricing === row.id}
                        onClick={() => reprice(row)}>
                        {repricing === row.id ? '…' : `Reprice → $${row.suggestedPrice.toFixed(2)}`}
                      </Btn>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// == Dashboard ==
function DashboardSection({ stats, cases, players, wagers }: { stats: DashboardStats|null; cases: AdminCase[]; players: DbPlayer[]; wagers: DbWager[] }) {
  const [period, setPeriod] = useState<'24h'|'7d'|'30d'>('24h');
  const s = stats;
  const registrations = period === '24h' ? s?.newRegistrations24h : period === '7d' ? s?.newRegistrations7d : s?.newRegistrations30d;
  const casesOpened   = period === '24h' ? s?.casesOpened24h    : period === '7d' ? s?.casesOpened7d    : s?.casesOpened30d;
  const wagerTotal    = period === '24h' ? s?.wagerTotal24h     : period === '7d' ? s?.wagerTotal7d     : s?.wagerTotal30d;
  return (
    <div>
      <PageHeader title="Dashboard" actions={
        <div style={{ display: 'flex', gap: 2, background: '#f3f4f6', border: `1px solid ${C.border}`, borderRadius: 8, padding: 3 }}>
          {(['24h','7d','30d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-funnel)', background: period === p ? '#fff' : 'transparent', color: period === p ? C.primary : C.muted, boxShadow: period === p ? '0 1px 2px rgba(0,0,0,.08)' : 'none' }}>{p}</button>
          ))}
        </div>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Players"     value={s?.totalPlayers ?? 0}       sub={`${s?.activePlayers24h ?? 0} active in 24h`} accent={C.accent} />
        <StatCard label="New Registrations" value={registrations ?? 0}          sub={`in last ${period}`} />
        <StatCard label="Cases Opened"      value={casesOpened ?? 0}            sub={`in last ${period}`} />
        <StatCard label="Total Wagered"     value={`$${(wagerTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} sub={`in last ${period}`} accent={C.success} />
        <StatCard label="Active Cases"      value={cases.length}                sub="published" />
        <StatCard label="Player Database"   value={players.length}              sub="total accounts" />
      </div>
      <div style={{ ...cardStyle, padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 15, margin: '0 0 18px', color: C.primary }}>Recent Wagers</h3>
        {wagers.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>No wager data yet.</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Player','Case','Amount','Won Item','Profit','Time'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: C.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {wagers.slice(0, 20).map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '9px 12px', color: C.primary, fontWeight: 600 }}>{(w.player_id ?? '—').slice(0, 8)}</td>
                  <td style={{ padding: '9px 12px', color: C.secondary }}>{w.case_name}</td>
                  <td style={{ padding: '9px 12px', color: C.secondary }}>${(w.amount ?? 0).toFixed(2)}</td>
                  <td style={{ padding: '9px 12px', color: C.secondary, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.won_item}</td>
                  <td style={{ padding: '9px 12px', color: (w.profit ?? 0) >= 0 ? C.success : C.danger, fontWeight: 600 }}>{(w.profit ?? 0) >= 0 ? '+' : ''}{(w.profit ?? 0).toFixed(2)}</td>
                  <td style={{ padding: '9px 12px', color: C.muted, fontSize: 11 }}>{new Date(w.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <CasePriceHealth />
    </div>
  );
}

// == Cases ==
function CasesSection({ cases, onNew, onEdit, onDelete, onLibrary }: { cases: AdminCase[]; onNew: () => void; onEdit: (c: AdminCase) => void; onDelete: (id: string) => void; onLibrary: () => void }) {
  return (
    <div>
      <PageHeader title="Cases" actions={<><Btn variant="secondary" onClick={onLibrary}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconImage /> Image Library</span></Btn><Btn onClick={onNew}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconPlus /> New Case</span></Btn></>} />
      {cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: C.muted, fontSize: 14 }}>No cases yet. Click <strong style={{ color: C.accent }}>New Case</strong> to build one.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {cases.map(c => {
            const ev = calcEV(c.skins); const price = parseFloat(c.price) || 0;
            const rtp = price > 0 ? (ev / price * 100).toFixed(1) : null;
            return (
              <div key={c.id} style={{ ...cardStyle, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <img src={c.image} alt={c.name} style={{ height: 96, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.15))' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: C.primary }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.secondary, marginBottom: 4 }}><CoinIcon size={12} /> {fmtCoins(usdToCoins(price))} · {c.skins.length} skins</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>EV {fmtCoins(usdToCoins(ev))} · Edge {c.houseEdge}%{rtp && <span style={{ color: parseFloat(rtp) >= 80 ? C.success : C.danger }}> · RTP {rtp}%</span>}</div>
                <div style={{ display: 'flex', gap: 8 }}><Btn variant="secondary" style={{ flex: 1 }} onClick={() => onEdit(c)}>Edit</Btn><Btn variant="danger" size="sm" onClick={() => onDelete(c.id)}><IconTrash /></Btn></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// == Players ==
function PlayersSection({ players, onUpdate, onDelete }: { players: DbPlayer[]; onUpdate: (p: Partial<DbPlayer> & { id?: string }) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [query, setQuery] = useState('');
  const [balanceEdits, setBalanceEdits] = useState<Record<string, string>>({});
  const [savingBalance, setSavingBalance] = useState<Record<string, boolean>>({});
  const filtered = players.filter(p => !query || p.username.toLowerCase().includes(query.toLowerCase()) || (p.email || '').toLowerCase().includes(query.toLowerCase()));

  async function saveBalance(p: DbPlayer) {
    const val = parseFloat(balanceEdits[p.id] ?? ''); if (isNaN(val)) return;
    setSavingBalance(s => ({ ...s, [p.id]: true })); await onUpdate({ id: p.id, balance: val });
    setSavingBalance(s => ({ ...s, [p.id]: false })); setBalanceEdits(s => { const c = { ...s }; delete c[p.id]; return c; });
  }
  async function toggleBan(p: DbPlayer) { await onUpdate({ id: p.id, status: p.status === 'banned' ? 'active' : 'banned' }); }

  return (
    <div>
      <PageHeader title="Players" actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
          <IconSearch />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search players..." style={{ background: 'transparent', border: 'none', outline: 'none', color: C.primary, fontFamily: 'var(--font-funnel)', fontSize: 13, width: 220 }} />
        </div>
      } />
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>{['Username','Steam ID','Balance','Wagered','Cases','Status','Registered','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: C.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>{players.length === 0 ? 'No players yet.' : 'No results.'}</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: C.primary }}>{p.username}</td>
                <td style={{ padding: '10px 14px', color: C.muted, fontSize: 11, fontFamily: 'monospace' }}>{p.steam_id || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input value={balanceEdits[p.id] ?? (p.balance || 0).toFixed(2)} onChange={e => setBalanceEdits(s => ({ ...s, [p.id]: e.target.value }))}
                      style={{ width: 80, background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', fontFamily: 'monospace', color: C.primary }} />
                    {balanceEdits[p.id] !== undefined && <Btn size="sm" onClick={() => saveBalance(p)} disabled={savingBalance[p.id]}>{savingBalance[p.id] ? '...' : 'Save'}</Btn>}
                  </div>
                </td>
                <td style={{ padding: '10px 14px', color: C.secondary }}>${(p.total_wagered || 0).toFixed(2)}</td>
                <td style={{ padding: '10px 14px', color: C.secondary }}>{p.cases_opened || 0}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.status === 'active' ? '#dcfce7' : '#fee2e2', color: p.status === 'active' ? C.success : C.danger }}>{p.status || 'active'}</span>
                </td>
                <td style={{ padding: '10px 14px', color: C.muted, fontSize: 11 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" variant={p.status === 'banned' ? 'primary' : 'danger'} onClick={() => toggleBan(p)}>{p.status === 'banned' ? 'Unban' : 'Ban'}</Btn>
                    <Btn size="sm" variant="danger" onClick={() => onDelete(p.id)}><IconTrash /></Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>{filtered.length} of {players.length} players</div>
    </div>
  );
}

// == Affiliates ==
type ReferralUses = Awaited<ReturnType<typeof fetchAllReferralUses>>;

function AffiliatesSection({ affiliates, onUpdate, onDelete }: { affiliates: DbAffiliate[]; onUpdate: (a: Partial<DbAffiliate>) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [selected, setSelected] = useState<DbAffiliate | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', platform: '', commission_pct: '5', notes: '' });
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState<DbReferralCode[]>([]);
  const [uses, setUses] = useState<ReferralUses>([]);
  const [newCodeForm, setNewCodeForm] = useState({ code: '', description: '', max_uses: '', expires_at: '', reward_type: 'coins', reward_value: '' });
  const [codesLoading, setCodesLoading] = useState(false);

  async function openAffiliate(a: DbAffiliate) {
    setSelected(a); setCodesLoading(true);
    const [c, u] = await Promise.all([fetchReferralCodes(a.id), fetchAllReferralUses()]);
    setCodes(c); setUses(u.filter(x => x.affiliate_id === a.id)); setCodesLoading(false);
  }
  async function handleCreate() {
    if (!form.name.trim()) return; setSaving(true);
    await onUpdate({ name: form.name, email: form.email, platform: form.platform, commission_pct: parseFloat(form.commission_pct) || 5, notes: form.notes });
    setForm({ name: '', email: '', platform: '', commission_pct: '5', notes: '' }); setCreating(false); setSaving(false);
  }
  async function handleIssueCode() {
    if (!selected || !newCodeForm.code.trim()) return;
    const result = await createReferralCode(selected.id, newCodeForm.code.trim().toUpperCase(), {
      description: newCodeForm.description || undefined,
      max_uses: newCodeForm.max_uses ? parseInt(newCodeForm.max_uses) : undefined,
      expires_at: newCodeForm.expires_at || undefined,
      reward_type: newCodeForm.reward_type as 'coins'|'free_cases'|'deposit_bonus',
      reward_value: newCodeForm.reward_value ? parseFloat(newCodeForm.reward_value) : undefined,
    });
    if (result) { setCodes(prev => [result, ...prev]); setNewCodeForm({ code: '', description: '', max_uses: '', expires_at: '', reward_type: 'coins', reward_value: '' }); }
  }
  async function handleDeleteCode(id: string) { await deleteReferralCode(id); setCodes(prev => prev.filter(x => x.id !== id)); }

  const totalWageredByReferrals = uses.reduce((sum, u) => sum + (u.wager_amount || 0), 0);
  const totalReward = selected ? totalWageredByReferrals * (selected.commission_pct / 100) : 0;
  const uniquePlayers = new Set(uses.map(u => u.player_id)).size;

  if (selected) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Btn variant="secondary" onClick={() => setSelected(null)}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconBack /> Back</span></Btn>
          <h1 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 22, margin: 0, color: C.primary }}>{selected.name}</h1>
          {selected.platform && <span style={{ fontSize: 12, color: C.secondary, background: '#f3f4f6', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 10px' }}>{selected.platform}</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard label="Referral Codes"   value={codes.length} />
          <StatCard label="Referred Players" value={uniquePlayers} accent={C.success} />
          <StatCard label="Wager Volume"     value={`$${totalWageredByReferrals.toFixed(2)}`} />
          <StatCard label={`Reward (${selected.commission_pct}%)`} value={`$${totalReward.toFixed(2)}`} accent={C.accent} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ ...cardStyle, padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 15, margin: '0 0 16px', color: C.primary }}>Referral Codes</h3>
            <div style={{ background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input value={newCodeForm.code} onChange={e => setNewCodeForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="CODE" maxLength={24} style={{ flex: 1, ...inputStyle, marginTop: 0, fontFamily: 'monospace' }} />
                <Btn onClick={handleIssueCode}>Issue</Btn>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Description</div><input value={newCodeForm.description} onChange={e => setNewCodeForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" style={inputStyle} /></div>
                <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Max Uses</div><input type="number" value={newCodeForm.max_uses} onChange={e => setNewCodeForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" style={inputStyle} /></div>
                <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Expires At</div><input type="date" value={newCodeForm.expires_at} onChange={e => setNewCodeForm(f => ({ ...f, expires_at: e.target.value }))} style={inputStyle} /></div>
                <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Reward Type</div><select value={newCodeForm.reward_type} onChange={e => setNewCodeForm(f => ({ ...f, reward_type: e.target.value }))} style={inputStyle}><option value="coins">Coins</option><option value="free_cases">Free Cases</option><option value="deposit_bonus">Deposit Bonus</option></select></div>
              </div>
              <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Reward Value</div><input type="number" value={newCodeForm.reward_value} onChange={e => setNewCodeForm(f => ({ ...f, reward_value: e.target.value }))} placeholder="e.g. 100" style={inputStyle} /></div>
            </div>
            {codesLoading ? <div style={{ color: C.muted, fontSize: 13 }}>Loading...</div> : codes.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>No codes issued yet.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {codes.map(code => {
                  const codeUses = uses.filter(u => u.code_id === code.id);
                  const codeReward = codeUses.reduce((s, u) => s + (u.wager_amount || 0), 0) * (selected.commission_pct / 100);
                  return (
                    <div key={code.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: C.primary, flex: 1 }}>{code.code}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{codeUses.length} uses</span>
                      <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>${codeReward.toFixed(2)}</span>
                      <Btn size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(`https://skinmaze.gg?ref=${code.code}`)}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCopy /> Copy</span></Btn>
                      <Btn size="sm" variant="danger" onClick={() => handleDeleteCode(code.id)}><IconX /></Btn>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...cardStyle, padding: 22 }}>
              <h3 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 15, margin: '0 0 14px', color: C.primary }}>Details</h3>
              {([['Email', selected.email || '—'], ['Platform', selected.platform || '—'], ['Commission', `${selected.commission_pct}%`], ['Since', new Date(selected.created_at).toLocaleDateString()]] as [string,string][]).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{k}</span><span style={{ color: C.primary, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              {selected.notes && <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>{selected.notes}</div>}
            </div>
            <div style={{ ...cardStyle, padding: 22 }}>
              <h3 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 15, margin: '0 0 14px', color: C.primary }}>Recent Activity</h3>
              {uses.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>No referral activity yet.</div> : uses.slice(0, 8).map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9fafb', fontSize: 12 }}>
                  <span style={{ color: C.secondary, fontFamily: 'monospace' }}>{u.code}</span>
                  <span style={{ color: C.success, fontWeight: 600 }}>${(u.wager_amount || 0).toFixed(2)}</span>
                  <span style={{ color: C.muted }}>{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Affiliates" actions={<Btn onClick={() => setCreating(true)}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconPlus /> New Affiliate</span></Btn>} />
      {creating && (
        <div style={{ ...cardStyle, padding: 24, marginBottom: 24, border: '1px solid #bfdbfe' }}>
          <h3 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 15, margin: '0 0 16px', color: C.primary }}>New Affiliate</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
            {([['Name *', 'name', 'e.g. xQc'], ['Email', 'email', ''], ['Platform', 'platform', 'Twitch / YouTube']] as [string,string,string][]).map(([label, key, ph]) => (
              <div key={key}><div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{label}</div><input value={(form as Record<string,string>)[key]} placeholder={ph} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} /></div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 18 }}>
            <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Commission %</div><input value={form.commission_pct} type="number" min="0" max="100" step="0.5" onChange={e => setForm(f => ({ ...f, commission_pct: e.target.value }))} style={inputStyle} /></div>
            <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Notes</div><input value={form.notes} placeholder="Deal notes..." onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Create Affiliate'}</Btn>
            <Btn variant="secondary" onClick={() => setCreating(false)}>Cancel</Btn>
          </div>
        </div>
      )}
      {affiliates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: C.muted, fontSize: 14 }}>No affiliates yet. Click <strong style={{ color: C.accent }}>New Affiliate</strong> to add one.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {affiliates.map(a => (
            <div key={a.id} style={{ ...cardStyle, padding: 20, cursor: 'pointer', transition: 'box-shadow .15s' }} onClick={() => openAffiliate(a)}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,.12)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,.08)'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 16, color: C.primary }}>{a.name}</div>
                <span style={{ fontSize: 11, color: C.accent, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>{a.commission_pct}% commission</span>
              </div>
              {a.platform && <div style={{ fontSize: 12, color: C.secondary, marginBottom: 4 }}>{a.platform}</div>}
              {a.email && <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{a.email}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: C.muted }}>Added {new Date(a.created_at).toLocaleDateString()}</span>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <Btn size="sm" variant="secondary" onClick={() => openAffiliate(a)}>Manage</Btn>
                  <Btn size="sm" variant="danger" onClick={() => onDelete(a.id)}><IconTrash /></Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// == AutoGeneratePanel ==
// Price ratios relative to blue (based on CS2 market averages)
const RAR_PRICE_RATIO: Record<Rarity, number> = { blue: 1, purple: 4, pink: 20, red: 80, gold: 250 };
const RAR_ORDER: Rarity[] = ['gold', 'red', 'pink', 'purple', 'blue'];
const RAR_LABELS: Record<Rarity, string> = { gold: 'Gold', red: 'Covert', pink: 'Classified', purple: 'Restricted', blue: 'Mil-Spec' };

function computeTargetPrices(evUsd: number, counts: Record<Rarity, number>): Record<Rarity, number> {
  // EV = sum_rar( RAR_DEFAULT_CHANCE[rar]/100 * count * avg_price_per_slot )
  // Prices proportional to RAR_PRICE_RATIO. Solve for base B.
  let coeff = 0;
  for (const rar of RAR_ORDER) {
    if (counts[rar] === 0) continue;
    coeff += (RAR_DEFAULT_CHANCE[rar] / 100) * RAR_PRICE_RATIO[rar];
  }
  const B = coeff > 0 ? evUsd / coeff : 0;
  const targets: Record<Rarity, number> = { blue: 0, purple: 0, pink: 0, red: 0, gold: 0 };
  for (const rar of RAR_ORDER) { targets[rar] = +(B * RAR_PRICE_RATIO[rar]).toFixed(2); }
  return targets;
}

interface AutoState { open: boolean; counts: Record<Rarity, number>; generating: boolean; error: string; }

function AutoGeneratePanel({ draft, houseEdge, onApply }: {
  draft: AdminCase; houseEdge: number;
  onApply: (skins: AdminSkin[]) => void;
}) {
  const [state, setState] = useState<AutoState>({
    open: false,
    counts: { gold: 1, red: 2, pink: 4, purple: 6, blue: 5 },
    generating: false, error: '',
  });

  const priceUsd = parseFloat(draft.price) || 0;
  const evUsd = priceUsd * (1 - houseEdge / 100);
  const totalSkins = RAR_ORDER.reduce((s, r) => s + state.counts[r], 0);
  const targets = computeTargetPrices(evUsd, state.counts);

  function setCount(rar: Rarity, v: number) {
    setState(s => ({ ...s, counts: { ...s.counts, [rar]: Math.max(0, v) } }));
  }

  async function generate() {
    if (priceUsd <= 0) { setState(s => ({ ...s, error: 'Set a case price first.' })); return; }
    setState(s => ({ ...s, generating: true, error: '' }));
    try {
      const selected: AdminSkin[] = [];
      for (const rar of RAR_ORDER) {
        const n = state.counts[rar];
        if (n === 0) continue;
        const target = targets[rar];
        const min = +(target * 0.5).toFixed(0);
        const max = +(target * 2).toFixed(0);
        const qs = new URLSearchParams({ count: '48', start: '0', rarity: rar, minPrice: String(min), maxPrice: String(max) });
        const res = await fetch(`/api/skin-search?${qs}`);
        const json = await res.json();
        const pool: SteamSkin[] = json.results || [];
        // Filter out already-selected skins to avoid duplicates
        const available = pool.filter(s => !selected.some(x => x.id === s.id));
        // Shuffle and pick n
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, n);
        // If not enough, widen range
        if (picked.length < n && pool.length < n) {
          const qs2 = new URLSearchParams({ count: '48', start: '0', rarity: rar });
          const res2 = await fetch(`/api/skin-search?${qs2}`);
          const j2 = await res2.json();
          const pool2: SteamSkin[] = (j2.results || []).filter((s: SteamSkin) => !selected.some(x => x.id === s.id));
          const extra = pool2.sort(() => Math.random() - 0.5).slice(0, n - picked.length);
          picked.push(...extra);
        }
        for (const s of picked) {
          const mappedRar: Rarity = (RAR_MAP[s.rarityName] || rar) as Rarity;
          selected.push({ id: s.id, name: s.name, skin: s.skin, marketName: s.fullName, rar: mappedRar, color: RAR[mappedRar]?.c || s.color, imageUrl: s.imageUrl, price: s.price, dropChance: RAR_DEFAULT_CHANCE[mappedRar] ?? RAR_DEFAULT_CHANCE.blue });
        }
      }
      if (selected.length === 0) { setState(s => ({ ...s, generating: false, error: 'No skins found. Try adjusting the rarity counts.' })); return; }
      // Normalize drop chances
      const sum = selected.reduce((a, s) => a + s.dropChance, 0);
      const normalized = selected.map(s => ({ ...s, dropChance: +(s.dropChance / sum * 100).toFixed(4) }));
      onApply(normalized);
      setState(s => ({ ...s, generating: false, open: false }));
    } catch (e) {
      setState(s => ({ ...s, generating: false, error: String(e) }));
    }
  }

  return (
    <div style={{ ...cardStyle, marginBottom: 14, overflow: 'hidden' }}>
      <button onClick={() => setState(s => ({ ...s, open: !s.open }))}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-funnel)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✨</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.primary }}>Auto-Generate Case</div>
            <div style={{ fontSize: 11, color: C.muted }}>Let the system pick skins based on your target price and rarity mix</div>
          </div>
        </div>
        <span style={{ color: C.muted, fontSize: 18 }}>{state.open ? '▲' : '▼'}</span>
      </button>

      {state.open && (
        <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginTop: 14, marginBottom: 14, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 12, color: C.secondary }}>
            Target EV: <strong style={{ color: C.accent }}>${evUsd.toFixed(2)} USD</strong> &nbsp;·&nbsp;
            Case price: <strong>${priceUsd.toFixed(2)}</strong> &nbsp;·&nbsp;
            House edge: <strong>{houseEdge}%</strong> &nbsp;·&nbsp;
            Total skins: <strong>{totalSkins}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 14 }}>
            {RAR_ORDER.map(rar => (
              <div key={rar} style={{ background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: RAR[rar].c, margin: '0 auto 6px' }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{RAR_LABELS[rar]}</div>
                <input type="number" min={0} max={20} value={state.counts[rar]}
                  onChange={e => setCount(rar, parseInt(e.target.value) || 0)}
                  style={{ width: '100%', textAlign: 'center', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 4px', fontSize: 14, fontWeight: 700, outline: 'none', color: C.primary }} />
                <div style={{ fontSize: 10, color: C.muted, marginTop: 5 }}>
                  {state.counts[rar] > 0 ? `~$${targets[rar].toFixed(0)} ea` : 'skip'}
                </div>
              </div>
            ))}
          </div>

          {state.error && <div style={{ color: C.danger, fontSize: 12, marginBottom: 10 }}>{state.error}</div>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Btn onClick={generate} disabled={state.generating || totalSkins === 0 || priceUsd <= 0}>
              {state.generating ? 'Generating…' : `Generate ${totalSkins} Skins`}
            </Btn>
            {draft.skins.length > 0 && <span style={{ fontSize: 11, color: C.muted }}>Will replace current {draft.skins.length} skin{draft.skins.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// == CaseBuilder ==
const CAT_TABS = ['All','Rifle','Pistol','Sniper','SMG','Shotgun','Machinegun','Knifes','Gloves'] as const;
const RAR_CHIPS = [
  { key: '',       label: 'All',        color: C.muted  },
  { key: 'gold',   label: 'Gold',       color: '#d97706' },
  { key: 'red',    label: 'Covert',     color: '#dc2626' },
  { key: 'pink',   label: 'Classified', color: '#a855f7' },
  { key: 'purple', label: 'Restricted', color: '#7c3aed' },
  { key: 'blue',   label: 'Mil-Spec',   color: '#2563eb' },
];
const PAGE_SIZE = 48;

function CaseBuilder({ initial, collections, onSave, onBack }: { initial: AdminCase; collections: ImageCollection[]; onSave: (c: AdminCase) => void; onBack: () => void }) {
  const [draft, setDraft] = useState<AdminCase>(initial);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [rarFilter, setRarFilter] = useState('');
  const [wearFilter, setWearFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<SteamSkin[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [totalAvail, setTotalAvail] = useState(0);

  const ev = useMemo(() => calcEV(draft.skins), [draft.skins]);
  const suggestedPrice = useMemo(() => calcPrice(draft.skins, draft.houseEdge), [draft.skins, draft.houseEdge]);
  const total = useMemo(() => totalChance(draft.skins), [draft.skins]);
  const totalOk = Math.abs(total - 100) < 0.01;

  useEffect(() => { if (draft.skins.length === 0) return; setDraft(d => ({ ...d, price: suggestedPrice.toFixed(2) })); }, [suggestedPrice]);

  function updateDropChance(id: string, val: number) { setDraft(d => ({ ...d, skins: d.skins.map(s => s.id === id ? { ...s, dropChance: val } : s) })); }

  function distributeEvenly() {
    if (!draft.skins.length) return;
    const skins = draft.skins.map(s => ({ ...s, dropChance: RAR_DEFAULT_CHANCE[s.rar] }));
    const sum = skins.reduce((a, s) => a + s.dropChance, 0);
    const normalized = skins.map(s => ({ ...s, dropChance: +(s.dropChance / sum * 100).toFixed(4) }));
    const diff = 100 - normalized.reduce((a, s) => a + s.dropChance, 0);
    if (normalized.length) normalized[normalized.length - 1].dropChance += diff;
    setDraft(d => ({ ...d, skins: normalized }));
  }
  function distributeEqual() {
    if (!draft.skins.length) return;
    const each = +(100 / draft.skins.length).toFixed(4);
    setDraft(d => ({ ...d, skins: d.skins.map((s, i) => ({ ...s, dropChance: i === d.skins.length - 1 ? +(100 - each * (d.skins.length - 1)).toFixed(4) : each })) }));
  }

  useEffect(() => { setPage(0); doFetch({ pg: 0 }); }, [catFilter, rarFilter, wearFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  const isFirstMount = useState(true);
  useEffect(() => { if (isFirstMount[0]) { isFirstMount[1](false); return; } doFetch({ pg: page }); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function doFetch(opts?: { pg?: number; q?: string }) {
    setSearching(true); setSearchErr('');
    const pg = opts?.pg ?? page; const q = opts?.q ?? query;
    try {
      const qs = new URLSearchParams({ count: String(PAGE_SIZE), start: String(pg * PAGE_SIZE) });
      if (q) qs.set('q', q); if (catFilter) qs.set('category', catFilter); if (rarFilter) qs.set('rarity', rarFilter);
      if (wearFilter) qs.set('wear', wearFilter); if (minPrice) qs.set('minPrice', minPrice); if (maxPrice) qs.set('maxPrice', maxPrice);
      const res = await fetch(`/api/skin-search?${qs}`); const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResults(json.results || []); setTotalAvail(json.total || 0);
    } catch (e) { setSearchErr(String(e)); setResults([]); } finally { setSearching(false); }
  }
  function applyFilters() { setPage(0); doFetch({ pg: 0 }); }
  function search() { if (!query.trim() && !catFilter && !rarFilter) return; setPage(0); doFetch({ pg: 0 }); }
  const totalPages = Math.ceil(totalAvail / PAGE_SIZE);

  function addSkin(s: SteamSkin) {
    if (draft.skins.some(x => x.id === s.id)) return;
    const rar: Rarity = (RAR_MAP[s.rarityName] || s.rar) as Rarity;
    const skin: AdminSkin = { id: s.id, name: s.name, skin: s.skin, marketName: s.fullName, rar, color: RAR[rar]?.c || s.color, imageUrl: s.imageUrl, price: s.price, dropChance: RAR_DEFAULT_CHANCE[rar] ?? RAR_DEFAULT_CHANCE.blue };
    setDraft(d => { const n = [...d.skins, skin]; const sum = n.reduce((a, x) => a + x.dropChance, 0); return { ...d, skins: n.map(x => ({ ...x, dropChance: +(x.dropChance / sum * 100).toFixed(4) })) }; });
  }
  function removeSkin(id: string) {
    setDraft(d => { const r = d.skins.filter(s => s.id !== id); if (!r.length) return { ...d, skins: [] }; const sum = r.reduce((a, s) => a + s.dropChance, 0); return { ...d, skins: r.map(s => ({ ...s, dropChance: +(s.dropChance / sum * 100).toFixed(4) })) }; });
  }

  const rtp = suggestedPrice > 0 ? (ev / suggestedPrice) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Btn variant="secondary" onClick={onBack}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconBack /> Back</span></Btn>
        <h1 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 22, margin: 0, flex: 1, color: C.primary }}>{draft.name || 'New Case'}</h1>
        <Btn onClick={() => totalOk ? onSave(draft) : undefined} disabled={!totalOk}>Save Case</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><img src={draft.image} alt="case" style={{ height: 100, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.15))' }} /></div>
            <FieldLabel>Case Name</FieldLabel>
            <FormInput value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} placeholder="e.g. Pandora Box" />
            <FieldLabel>Case Image</FieldLabel>
            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {collections.map(col => (
                <div key={col.id}>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7, fontWeight: 600 }}>{col.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                    {col.images.map((img, i) => (
                      <div key={i} onClick={() => setDraft(d => ({ ...d, image: img }))} style={{ borderRadius: 8, padding: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: draft.image === img ? '#eff6ff' : '#f9fafb', border: `1px solid ${draft.image === img ? C.accent : C.border}` }}>
                        <img src={img} style={{ height: 44, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                      </div>
                    ))}
                    {col.images.length === 0 && <div style={{ gridColumn: '1/-1', fontSize: 11, color: C.muted, textAlign: 'center', padding: '8px 0' }}>No images</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: C.primary }}>Case Economics</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.secondary }}>House Edge</span>
                <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>{draft.houseEdge}%</span>
              </div>
              <input type="range" min={1} max={30} step={0.5} value={draft.houseEdge} onChange={e => setDraft(d => ({ ...d, houseEdge: parseFloat(e.target.value) }))} style={{ width: '100%', accentColor: C.accent }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginTop: 4 }}><span>1% player-friendly</span><span>30% house-heavy</span></div>
            </div>
            <div style={{ background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <MathRow label="Expected Value (EV)" value={`$${ev.toFixed(2)}`} />
              <MathRow label="House Edge" value={`${draft.houseEdge}%`} />
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 9 }}><MathRow label="Suggested Price" value={`$${suggestedPrice.toFixed(2)}`} highlight /></div>
              <MathRow label="RTP" value={`${rtp.toFixed(1)}%`} valueColor={rtp >= 80 ? C.success : rtp >= 70 ? C.warning : C.danger} />
              <MathRow label="House profit per open" value={`$${(suggestedPrice - ev).toFixed(2)}`} />
            </div>
            <div style={{ marginTop: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Case price (auto-calculated)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CoinIcon size={20} /><span style={{ fontFamily: 'var(--font-funnel)', fontWeight: 800, fontSize: 24, color: C.accent }}>{suggestedPrice > 0 ? fmtCoins(usdToCoins(suggestedPrice)) : '—'}</span></div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>EV ${ev.toFixed(2)} / (1 - {draft.houseEdge}%) = ${suggestedPrice.toFixed(2)} USD</div>
            </div>
          </div>
        </div>

        <div>
          <AutoGeneratePanel draft={draft} houseEdge={draft.houseEdge} onApply={skins => setDraft(d => ({ ...d, skins }))} />
          <div style={{ ...cardStyle, padding: 18, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: C.primary }}>Browse Steam Market Skins</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px' }}>
                <IconSearch />
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Search by name..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-funnel)', fontSize: 13, color: C.primary, padding: '10px 0' }} />
              </div>
              <Btn onClick={search} disabled={searching}>{searching ? '...' : 'Search'}</Btn>
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
              {CAT_TABS.map(cat => { const active = catFilter === (cat === 'All' ? '' : cat); return <span key={cat} onClick={() => { setCatFilter(cat === 'All' ? '' : cat); setQuery(''); }} style={{ whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: active ? '#eff6ff' : '#f3f4f6', border: active ? '1px solid #bfdbfe' : `1px solid ${C.border}`, color: active ? C.accent : C.secondary }}>{cat}</span>; })}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {RAR_CHIPS.map(r => { const active = rarFilter === r.key; return <span key={r.key} onClick={() => setRarFilter(r.key)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', background: active ? `${r.color}18` : '#f3f4f6', border: active ? `1px solid ${r.color}66` : `1px solid ${C.border}`, color: active ? r.color : C.secondary }}>{r.key && <div style={{ width: 7, height: 7, borderRadius: 2, background: r.color, flexShrink: 0 }} />}{r.label}</span>; })}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {[{ key: '', label: 'All' }, { key: 'Factory New', label: 'FN' }, { key: 'Minimal Wear', label: 'MW' }, { key: 'Field-Tested', label: 'FT' }, { key: 'Well-Worn', label: 'WW' }, { key: 'Battle-Scarred', label: 'BS' }].map(w => { const active = wearFilter === w.key; return <span key={w.key} onClick={() => setWearFilter(w.key)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: active ? '#eff6ff' : '#f3f4f6', border: active ? '1px solid #bfdbfe' : `1px solid ${C.border}`, color: active ? C.accent : C.secondary }}>{w.label}</span>; })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: C.secondary, whiteSpace: 'nowrap' }}>Price $</span>
              <input type="number" min={0} step={1} placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} style={{ width: 80, background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 10px', color: C.primary, fontSize: 12, outline: 'none' }} />
              <span style={{ color: C.muted }}>—</span>
              <input type="number" min={0} step={1} placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} style={{ width: 80, background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 10px', color: C.primary, fontSize: 12, outline: 'none' }} />
              <Btn size="sm" variant="secondary" onClick={applyFilters}>Apply</Btn>
              {(minPrice || maxPrice) && <Btn size="sm" variant="danger" onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(0); doFetch({ pg: 0 }); }}><IconX /></Btn>}
            </div>
            {searchErr && <div style={{ fontSize: 12, color: C.danger, marginTop: 10 }}>{searchErr}</div>}
            {!searching && totalAvail > 0 && <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>{totalAvail.toLocaleString()} results &middot; page {page + 1} of {totalPages}</div>}
          </div>

          {searching && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>{Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ height: 200, borderRadius: 10, background: '#f3f4f6', border: `1px solid ${C.border}` }} />)}</div>}

          {!searching && results.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>
              {results.map(s => {
                const already = draft.skins.some(x => x.id === s.id);
                return (
                  <div key={s.id} style={{ position: 'relative', background: '#fff', border: `1px solid ${already ? C.accent : C.border}`, borderRadius: 10, padding: '12px 10px', cursor: already ? 'default' : 'pointer', overflow: 'hidden', transition: 'box-shadow .12s', opacity: already ? .7 : 1 }}
                    onClick={() => !already && addSkin(s)}
                    onMouseEnter={e => { if (!already) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                    {already && <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 6, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IconCheck /></div>}
                    {s.isStatTrak && <div style={{ position: 'absolute', top: 8, left: 8, background: '#d97706', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700, color: '#fff' }}>ST</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 90, margin: '6px 0 8px' }}>
                      <img src={s.imageUrl} alt={s.fullName} style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 10, color: C.muted }}>{s.name}</div>
                    <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 11, color: s.color, lineHeight: 1.3 }}>{s.skin}</div>
                    <div style={{ textAlign: 'center', fontSize: 10, color: C.muted, marginTop: 2 }}>{s.wear}</div>
                    <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12, fontWeight: 700, color: C.primary }}>${s.priceDisplay}</div>
                  </div>
                );
              })}
            </div>
          )}
          {!searching && results.length === 0 && !searchErr && <div style={{ textAlign: 'center', color: C.muted, padding: 40, fontSize: 13 }}>{query ? `No results for "${query}"` : 'Select a category or search by name above'}</div>}

          {totalPages > 1 && !searching && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
              <button onClick={() => setPage(0)} disabled={page === 0} style={pageBtnStyle(false, page === 0)}>«</button>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={pageBtnStyle(false, page === 0)}>‹</button>
              {pageNumbers(page, totalPages).map((p, i) => p === '…' ? <span key={`e-${i}`} style={{ color: C.muted, fontSize: 13, padding: '0 4px' }}>...</span> : <button key={p} onClick={() => setPage(p as number)} style={pageBtnStyle(p === page, false)}>{(p as number) + 1}</button>)}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={pageBtnStyle(false, page >= totalPages - 1)}>›</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={pageBtnStyle(false, page >= totalPages - 1)}>»</button>
            </div>
          )}

          <div style={{ ...cardStyle, padding: 20, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.primary }}>Skins in Case <span style={{ color: C.accent }}>({draft.skins.length})</span></div>
              {draft.skins.length > 0 && <div style={{ display: 'flex', gap: 8 }}><Btn size="sm" variant="secondary" onClick={distributeEvenly}>CS2 weights</Btn><Btn size="sm" variant="ghost" onClick={distributeEqual}>Equal split</Btn></div>}
            </div>
            {draft.skins.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '9px 14px', borderRadius: 8, background: totalOk ? '#f0fdf4' : '#fef2f2', border: `1px solid ${totalOk ? '#bbf7d0' : '#fecaca'}` }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#e5e7eb', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(total, 100)}%`, borderRadius: 2, background: totalOk ? C.success : total > 100 ? C.danger : C.warning, transition: 'width .2s' }} /></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: totalOk ? C.success : total > 100 ? C.danger : C.warning, whiteSpace: 'nowrap' }}>{total.toFixed(2)}% {totalOk ? '' : total > 100 ? 'over 100%' : 'under 100%'}</span>
              </div>
            )}
            {draft.skins.length === 0 && <div style={{ fontSize: 13, color: C.muted, textAlign: 'center', padding: '24px 0' }}>Click a skin above to add it to the case</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
              {draft.skins.map(s => (
                <div key={s.id} style={{ background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <SkinImage marketName={s.marketName} imageUrl={s.imageUrl} size={48} glowColor={s.color} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.skin}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{RAR[s.rar].n}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>${s.price.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>EV ${(s.price * s.dropChance / 100).toFixed(3)}</div>
                    </div>
                    <button onClick={() => removeSkin(s.id)} style={{ width: 26, height: 26, borderRadius: 6, background: '#fff', border: `1px solid ${C.border}`, color: C.danger, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconX /></button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="range" min={0.01} max={100} step={0.01} value={s.dropChance} onChange={e => updateDropChance(s.id, parseFloat(e.target.value))} style={{ flex: 1, accentColor: s.color }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <input type="number" min={0.01} max={100} step={0.01} value={s.dropChance.toFixed(2)} onChange={e => updateDropChance(s.id, Math.max(0.01, Math.min(100, parseFloat(e.target.value) || 0)))} style={{ width: 60, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 6px', color: C.primary, fontSize: 12, outline: 'none' }} />
                      <span style={{ fontSize: 11, color: C.muted }}>%</span>
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

// == HomeLayoutManager ==
function HomeLayoutManager({ layout, onChange, onBack, cases: allCases }: { layout: HomeSection[]; onChange: (l: HomeSection[]) => void; onBack: () => void; cases: AdminCase[] }) {
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateSection(id: string, patch: Partial<HomeSection>) { onChange(layout.map(s => s.id === id ? { ...s, ...patch } : s)); }
  function toggleCase(sectionId: string, caseId: string) {
    const section = layout.find(s => s.id === sectionId)!;
    const has = section.caseIds.includes(caseId);
    updateSection(sectionId, { caseIds: has ? section.caseIds.filter(x => x !== caseId) : section.caseIds.length < 5 ? [...section.caseIds, caseId] : section.caseIds });
  }
  function handleSave() { onChange(layout); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function resetSection(id: string) { const def = DEFAULT_HOME_LAYOUT.find(s => s.id === id); if (def) updateSection(id, { ...def }); }
  const SECTION_LABELS = ['1st', '2nd', '3rd', '4th'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Btn variant="secondary" onClick={onBack}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconBack /> Back</span></Btn>
        <h1 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 22, margin: 0, flex: 1, color: C.primary }}>Home Layout</h1>
        <Btn style={{ background: saved ? '#f0fdf4' : C.accent, color: saved ? C.success : '#fff', border: saved ? '1px solid #bbf7d0' : `1px solid ${C.accent}` }} onClick={handleSave}>{saved ? 'Saved' : 'Save Layout'}</Btn>
      </div>
      <div style={{ fontSize: 13, color: C.secondary, marginBottom: 20, padding: '10px 16px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8 }}>Configure which cases appear in each of the 4 homepage sections. Each section shows up to 5 cases.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {layout.map((section, idx) => (
          <div key={section.id} style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: C.accent, whiteSpace: 'nowrap' }}>{SECTION_LABELS[idx]} Section</div>
              <input value={section.title} onChange={e => updateSection(section.id, { title: e.target.value })} style={{ flex: 1, background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.primary, fontFamily: 'var(--font-funnel)', fontWeight: 600, fontSize: 14, outline: 'none' }} />
              <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{section.caseIds.length}/5 cases</span>
              <Btn size="sm" variant="ghost" onClick={() => resetSection(section.id)}>Reset</Btn>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 14 }}>
              {section.caseIds.map(cid => { const c = allCases.find(x => x.id === cid); if (!c) return null; return (
                <div key={cid} style={{ position: 'relative', background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <img src={c.image} alt={c.name} style={{ height: 60, objectFit: 'contain', marginBottom: 6 }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                  <div style={{ fontSize: 10, color: C.primary, fontWeight: 600, lineHeight: 1.3 }}>{c.name}</div>
                  <button onClick={() => toggleCase(section.id, cid)} style={{ position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: 4, background: '#fff', border: `1px solid ${C.border}`, color: C.danger, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconX /></button>
                </div>
              ); })}
              {section.caseIds.length < 5 && (
                <div onClick={() => setPickingFor(pickingFor === section.id ? null : section.id)} style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, cursor: 'pointer', color: C.muted, fontSize: 12, background: pickingFor === section.id ? '#f0f9ff' : 'transparent' }}>
                  <IconPlus /><span>Add</span>
                </div>
              )}
            </div>
            {pickingFor === section.id && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Click a case to add it to this section</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {allCases.map(c => { const isSel = section.caseIds.includes(c.id); return (
                    <div key={c.id} onClick={() => !isSel && toggleCase(section.id, c.id)} style={{ background: isSel ? '#eff6ff' : '#f9fafb', border: `1px solid ${isSel ? '#bfdbfe' : C.border}`, borderRadius: 8, padding: 8, textAlign: 'center', cursor: isSel ? 'default' : 'pointer', opacity: isSel ? 0.6 : 1 }}>
                      <img src={c.image} alt={c.name} style={{ height: 48, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                      <div style={{ fontSize: 9, color: C.secondary, marginTop: 4, lineHeight: 1.3 }}>{c.name}</div>
                      {isSel && <div style={{ fontSize: 9, color: C.accent, fontWeight: 700 }}>Added</div>}
                    </div>
                  ); })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// == LibraryManager ==
function LibraryManager({ collections, onChange, onBack }: { collections: ImageCollection[]; onChange: (cols: ImageCollection[]) => void; onBack: () => void }) {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function addCollection() { if (!newName.trim()) return; onChange([...collections, { id: Date.now().toString(), name: newName.trim(), images: [] }]); setNewName(''); }
  function renameCollection(id: string, name: string) { onChange(collections.map(c => c.id === id ? { ...c, name } : c)); }
  function removeImage(colId: string, idx: number) { onChange(collections.map(c => c.id === colId ? { ...c, images: c.images.filter((_, i) => i !== idx) } : c)); }
  function handleFiles(colId: string, files: FileList | null) {
    if (!files || !files.length) return;
    Promise.all(Array.from(files).map(f => new Promise<string>(resolve => { const r = new FileReader(); r.onload = e => resolve(e.target?.result as string); r.readAsDataURL(f); }))).then(urls => onChange(collections.map(c => c.id === colId ? { ...c, images: [...c.images, ...urls] } : c)));
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Btn variant="secondary" onClick={onBack}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconBack /> Back</span></Btn>
        <h1 style={{ fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 22, margin: 0, flex: 1, color: C.primary }}>Image Library</h1>
      </div>
      <div style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: C.primary, marginBottom: 12 }}>New Collection</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCollection()} placeholder="Collection name" style={{ flex: 1, ...inputStyle, marginTop: 0 }} />
          <Btn onClick={addCollection}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconPlus /> Create</span></Btn>
        </div>
      </div>
      {collections.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: C.muted, fontSize: 13 }}>No collections yet.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {collections.map(col => (
          <div key={col.id} style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <input value={editingName[col.id] ?? col.name} onChange={e => setEditingName(n => ({ ...n, [col.id]: e.target.value }))}
                onBlur={() => { const name = editingName[col.id]; if (name !== undefined && name.trim()) renameCollection(col.id, name.trim()); setEditingName(n => { const c = { ...n }; delete c[col.id]; return c; }); }}
                style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`, color: C.primary, fontFamily: 'var(--font-funnel)', fontWeight: 700, fontSize: 15, outline: 'none', padding: '4px 0' }} />
              <span style={{ fontSize: 12, color: C.muted }}>{col.images.length} image{col.images.length !== 1 ? 's' : ''}</span>
              <Btn size="sm" variant="secondary" onClick={() => fileRefs.current[col.id]?.click()}><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconPlus /> Upload</span></Btn>
              <input ref={el => { fileRefs.current[col.id] = el; }} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(col.id, e.target.files)} />
              {col.id !== 'classic' && <Btn size="sm" variant="danger" onClick={() => onChange(collections.filter(c => c.id !== col.id))}><IconTrash /></Btn>}
            </div>
            {col.images.length === 0 ? (
              <div onClick={() => fileRefs.current[col.id]?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: '32px 0', textAlign: 'center', color: C.muted, fontSize: 13, cursor: 'pointer' }}>Click Upload or drop images here</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
                {col.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={img} style={{ height: 80, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                    <button onClick={() => removeImage(col.id, idx)} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 5, background: '#fff', border: `1px solid ${C.border}`, color: C.danger, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconX /></button>
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

// == Utilities ==
function pageBtnStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return { minWidth: 34, height: 34, borderRadius: 7, border: active ? `1px solid ${C.accent}` : `1px solid ${C.border}`, background: active ? C.accent : '#fff', color: active ? '#fff' : disabled ? C.muted : C.primary, fontSize: 13, fontWeight: active ? 700 : 400, cursor: disabled ? 'default' : 'pointer', padding: '0 8px', fontFamily: 'var(--font-funnel)' };
}
function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '…')[] = []; const addPage = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  addPage(0); if (current > 3) pages.push('…');
  for (let i = Math.max(1, current - 2); i <= Math.min(total - 2, current + 2); i++) addPage(i);
  if (current < total - 4) pages.push('…'); addPage(total - 1); return pages;
}
function MathRow({ label, value, highlight, valueColor }: { label: string; value: string; highlight?: boolean; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: highlight ? C.primary : C.muted }}>{label}</span>
      <span style={{ fontSize: highlight ? 14 : 12, fontWeight: highlight ? 700 : 600, color: valueColor || (highlight ? C.accent : C.secondary) }}>{value}</span>
    </div>
  );
}
