'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';
import { NormalizedSkin } from '@/app/lib/csfloat';
import { CASE_IMAGES, RAR, Rarity } from '@/app/lib/data';
import { SkinImage } from '../SkinImage';
import { CoinIcon } from '../CoinIcon';

interface AdminSkin {
  id: string;
  name: string;
  skin: string;
  marketName: string;
  rar: Rarity;
  color: string;
  imageUrl: string;
  price: number;
}

interface AdminCase {
  id: string;
  name: string;
  price: string;
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

// Map CSFloat rarity int → our Rarity
const CF_RAR: Record<number, Rarity> = { 1:'blue',2:'blue',3:'blue',4:'purple',5:'pink',6:'red',7:'gold' };

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
      price: '99.99',
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
          {cases.map(c => (
            <div key={c.id} style={{ background: '#0c0f0b', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <img src={c.image} alt={c.name} style={{ height: 100, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.6))' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{c.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#9aa39a', marginBottom: 10 }}>
                <CoinIcon size={13} />{c.price} · {c.skins.length} skins
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
          ))}
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
    const skin: AdminSkin = {
      id: s.id,
      name: s.name,
      skin: s.skin,
      marketName: s.fullName,
      rar: CF_RAR[4] as Rarity, // default purple; override below
      color: s.color,
      imageUrl: s.imageUrl,
      price: s.price,
    };
    // Try to map rarity from rarityName
    const rarMap: Record<string, Rarity> = {
      'Consumer Grade': 'blue', 'Industrial Grade': 'blue', 'Mil-Spec Grade': 'blue',
      'Restricted': 'purple', 'Classified': 'pink', 'Covert': 'red',
      'Extraordinary': 'gold', 'Exceedingly Rare ★': 'gold',
      'High Grade': 'blue', 'Remarkable': 'purple', 'Exotic': 'pink', 'Contraband': 'gold',
    };
    skin.rar = rarMap[s.rarityName] || 'blue';
    skin.color = RAR[skin.rar].c;
    setDraft(d => ({ ...d, skins: [...d.skins, skin] }));
  }

  function removeSkin(id: string) {
    setDraft(d => ({ ...d, skins: d.skins.filter(s => s.id !== id) }));
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9aa39a', fontSize: 13, cursor: 'pointer' }}>‹ Back</button>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 22, margin: 0, flex: 1 }}>
          {draft.id === initial.id && !initial.name ? 'New Case' : draft.name}
        </h1>
        <button onClick={() => onSave(draft)} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a',
          background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 28px', borderRadius: 11, cursor: 'pointer' }}>
          Save Case
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: case metadata */}
        <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <img src={draft.image} alt="case" style={{ height: 120, objectFit: 'contain', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.6))' }} />
          </div>

          <Label>Case Name</Label>
          <Input value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} placeholder="e.g. Pandora Box" />

          <Label>Price (coins)</Label>
          <Input value={draft.price} onChange={v => setDraft(d => ({ ...d, price: v }))} placeholder="e.g. 999.99" />

          <Label>Case Image</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {CASE_IMAGES.map(img => (
              <div key={img} onClick={() => setDraft(d => ({ ...d, image: img }))}
                style={{ borderRadius: 10, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: draft.image === img ? 'rgba(95,213,95,.14)' : '#0e120e',
                  border: `1px solid ${draft.image === img ? 'rgba(95,213,95,.5)' : 'rgba(255,255,255,.07)'}` }}>
                <img src={img} style={{ height: 52, objectFit: 'contain' }} />
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14, marginTop: 4 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#cfd4cf' }}>
              Skins in case <span style={{ color: '#7fe877' }}>({draft.skins.length})</span>
            </div>
            {draft.skins.length === 0 && (
              <div style={{ fontSize: 12, color: '#6b746b', textAlign: 'center', padding: '16px 0' }}>Search and add skins →</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {draft.skins.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0e120e',
                  border: `1px solid ${s.color}44`, borderRadius: 10, padding: '8px 10px' }}>
                  <SkinImage marketName={s.marketName} size={40} glowColor={s.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#9aa39a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.skin}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b746b', marginRight: 4 }}>${s.price.toFixed(2)}</div>
                  <button onClick={() => removeSkin(s.id)}
                    style={{ width: 22, height: 22, borderRadius: 6, background: '#1a1014', border: '1px solid rgba(235,75,75,.2)', color: '#eb4b4b', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>✕</button>
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
