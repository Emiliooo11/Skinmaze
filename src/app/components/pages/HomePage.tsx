'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';
import { CaseItem, PAY_METHODS, BEST_TABS } from '@/app/lib/data';
import { HOME_LAYOUT_KEY, DEFAULT_HOME_LAYOUT, HomeSection } from '@/app/components/pages/AdminPage';
import { fetchCases, fetchHomeLayout } from '@/app/lib/db';
import { CoinIcon } from '../CoinIcon';
import { Placeholder } from '../Placeholder';
import { RarityBar } from '../RarityBar';

function tabStyle(active: boolean) {
  return {
    border: active ? '1px solid rgba(95,213,95,.5)' : '1px solid rgba(255,255,255,.08)',
    background: active ? 'rgba(95,213,95,.14)' : '#0e120e',
    color: active ? '#7fe877' : '#9aa39a',
  };
}

function CaseCard({ name, price, onOpen, height = 128 }: { name: string; price: string; onOpen: () => void; height?: number }) {
  return (
    <div onClick={onOpen} style={{ background: '#0e120e', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14,
      padding: 14, cursor: 'pointer', transition: 'transform .14s, border-color .14s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(95,213,95,.4)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,.06)'; }}>
      <Placeholder label="case render" height={height} />
      <RarityBar />
      <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 14 }}>{name}</div>
      <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 5, fontSize: 13, color: '#cfd4cf' }}>
        <CoinIcon size={13} />{price}
      </div>
    </div>
  );
}

const SECTION_GLOWS = [
  'rgba(230,195,62,.35)',
  'rgba(95,213,95,.3)',
  'rgba(230,75,75,.28)',
  'rgba(95,95,230,.28)',
];

interface PlatformStats { totalPlayers: number; onlinePlayers: number; casesOpened: number; }

export function HomePage() {
  const { go, login, openCase, flash, bestTab, setBestTab } = useStore();
  const [layout, setLayout] = useState<HomeSection[]>(DEFAULT_HOME_LAYOUT);
  const [dbCaseMap, setDbCaseMap] = useState<Map<string, CaseItem>>(new Map());
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    fetch('/api/platform-stats').then(r => r.ok ? r.json() : null).then(d => { if (d) setPlatformStats(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    // Load layout from Supabase, fall back to localStorage
    fetchHomeLayout().then(rows => {
      if (rows.length > 0) {
        setLayout(rows.map(r => ({ id: r.id, title: r.title, icon: r.icon, caseIds: r.case_ids })));
      } else {
        try {
          const stored = JSON.parse(localStorage.getItem(HOME_LAYOUT_KEY) || 'null');
          if (stored) setLayout(stored);
        } catch {}
      }
    });
    // Load cases from Supabase for section rendering
    fetchCases().then(rows => {
      if (rows.length > 0) {
        const map = new Map<string, CaseItem>();
        rows.forEach(c => map.set(c.id, {
          id: c.id,
          name: c.name,
          price: c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          image: c.image_url || '/cases/case-water-camo.png',
        }));
        setDbCaseMap(map);
      }
    });
  }, []);

  const resolveCases = (ids: string[]): CaseItem[] =>
    ids.map(id => dbCaseMap.get(id)).filter(Boolean) as CaseItem[];

  const [s1, s2, s3, s4] = layout;
  const section1Cases = resolveCases(s1?.caseIds ?? []);
  const section2Cases = resolveCases(s2?.caseIds ?? []);
  const section3Cases = resolveCases(s3?.caseIds ?? []);
  const bestItems     = resolveCases(s4?.caseIds ?? []);

  return (
    <div>
      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 20, marginBottom: 34 }}>
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden',
          background: 'linear-gradient(110deg,#0e1410 0%,#10180f 60%,#16240f 100%)',
          border: '1px solid rgba(255,255,255,.06)', padding: '34px 36px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 210 }}>
          <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
            width: 150, height: 160, borderRadius: 14,
            backgroundImage: 'repeating-linear-gradient(135deg,rgba(120,180,120,.08) 0 9px,transparent 9px 18px)',
            border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5c6b5c' }}>mascot</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 30, margin: '0 0 10px' }}>Welcome to SkinMaze</h1>
          <p style={{ margin: '0 0 22px', color: '#9aa39a', fontSize: 14, lineHeight: 1.55, maxWidth: 330 }}>
            Your premier place for CS2 Fun!<br />Register and get deposit bonus &amp; 5 Free Cases
          </p>
          <button onClick={login} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a',
            background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '13px 28px',
            borderRadius: 11, cursor: 'pointer', width: 'fit-content', boxShadow: '0 8px 20px rgba(95,213,95,.3)' }}>
            Login/Register
          </button>
        </div>
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: '#0e1210',
          border: '1px solid rgba(230,195,62,.4)', padding: '26px 28px', boxShadow: '0 0 40px rgba(230,195,62,.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 24, margin: '0 0 12px' }}>
                Highest <span style={{ color: '#5fd75f' }}>Win</span>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 20, marginBottom: 16 }}>
                <CoinIcon size={18} />1,343.09
              </div>
              <div style={{ display: 'inline-flex', background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: 3, gap: 2 }}>
                {['Daily','Weekly','Monthly'].map((t, i) => (
                  <span key={t} style={{ padding: '6px 14px', borderRadius: 7, background: i === 0 ? '#1c241b' : 'transparent',
                    color: i === 0 ? '#e8ece8' : '#8a928a', fontSize: 12, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ width: 120, height: 130, borderRadius: 12, background: '#120c0c',
              backgroundImage: 'repeating-linear-gradient(135deg,rgba(230,75,75,.12) 0 8px,transparent 8px 16px)',
              border: '1px solid rgba(230,75,75,.4)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end', padding: 10, textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7a5c5c', marginBottom: 'auto', marginTop: 8 }}>skin render</span>
              <span style={{ fontSize: 10, color: '#9aa39a' }}>AWP</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#eb4b4b' }}>Dragon Lore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1 */}
      {section1Cases.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '18px 20px 22px',
          marginBottom: 22, background: '#0b0e0a', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 340, height: 80, background: `radial-gradient(ellipse at center,${SECTION_GLOWS[0]},transparent 70%)`, opacity: .5 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, position: 'relative' }}>
            <span style={{ fontSize: 18 }}>{s1?.icon}</span>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 19, margin: 0 }}>{s1?.title}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
            {section1Cases.map(c => <CaseCard key={c.id} name={c.name} price={c.price} onOpen={() => openCase(c)} />)}
          </div>
        </div>
      )}

      {/* Section 2 */}
      {section2Cases.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '18px 20px 22px',
          marginBottom: 22, background: '#0b0e0a', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 340, height: 80, background: `radial-gradient(ellipse at center,${SECTION_GLOWS[1]},transparent 70%)`, opacity: .5 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, position: 'relative' }}>
            <span style={{ fontSize: 18 }}>{s2?.icon}</span>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 19, margin: 0 }}>{s2?.title}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
            {section2Cases.map(c => <CaseCard key={c.id} name={c.name} price={c.price} onOpen={() => openCase(c)} />)}
          </div>
        </div>
      )}

      {/* Section 3 */}
      {section3Cases.length > 0 && (
        <div style={{ border: '1px solid rgba(230,75,75,.18)', borderRadius: 16, padding: '18px 20px 22px', marginBottom: 30,
          background: '#0c0909', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 340, height: 80, background: `radial-gradient(ellipse at center,${SECTION_GLOWS[2]},transparent 70%)`, opacity: .6 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, position: 'relative' }}>
            <span style={{ fontSize: 18 }}>{s3?.icon}</span>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 19, margin: 0 }}>{s3?.title}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
            {section3Cases.map(c => <CaseCard key={c.id} name={c.name} price={c.price} onOpen={() => openCase(c)} />)}
          </div>
        </div>
      )}

      {/* Section 4 — Best Sellers */}
      {bestItems.length > 0 && (
        <div style={{ borderRadius: 18, padding: '30px 24px 28px', marginBottom: 26,
          background: 'radial-gradient(ellipse at center,#15130a,#0a0c08 75%)',
          border: '1px solid rgba(230,195,62,.14)', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 30, textAlign: 'center', margin: '0 0 4px',
            letterSpacing: 2, background: 'linear-gradient(180deg,#ffe88a,#d99a1e)', WebkitBackgroundClip: 'text',
            backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s4?.title?.toUpperCase() ?? 'BEST SELLERS'}</h2>
          <p style={{ textAlign: 'center', color: '#9aa39a', fontSize: 13, margin: '0 0 18px' }}>
            The most expensive and top collection for the best players
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
            {BEST_TABS.map(label => {
              const st = tabStyle(bestTab === label);
              return (
                <span key={label} onClick={() => setBestTab(label)} style={{ padding: '8px 16px', borderRadius: 9,
                  fontSize: 12.5, fontWeight: 500, cursor: 'pointer', ...st }}>
                  {label}
                </span>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
            {bestItems.map(c => <CaseCard key={c.id} name={c.name} price={c.price} onOpen={() => openCase(c)} />)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 34 }}>
        <button onClick={() => go('cases')} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14,
          color: '#cfd4cf', background: '#0e120e', border: '1px solid rgba(255,255,255,.12)',
          padding: '13px 26px', borderRadius: 11, cursor: 'pointer' }}>Explore all Cases +</button>
      </div>

      {/* Deposit strip */}
      <div style={{ border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '22px 26px', marginBottom: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        background: '#0b0e0a', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20 }}>Make Deposit</div>
          <div style={{ color: '#9aa39a', fontSize: 13 }}>50+ Methods</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', color: '#aeb6ae', fontSize: 13, fontWeight: 600 }}>
          {PAY_METHODS.map(p => (
            <span key={p} style={{ background: '#11140f', border: '1px solid rgba(255,255,255,.07)', padding: '7px 13px', borderRadius: 8 }}>{p}</span>
          ))}
        </div>
        <button onClick={() => flash('Coming soon ✨')} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700,
          fontSize: 14, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)',
          border: 'none', padding: '12px 26px', borderRadius: 11, cursor: 'pointer' }}>Deposit</button>
      </div>

      {/* Support cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
        <div style={{ border: '1px solid rgba(95,213,95,.2)', borderRadius: 16, padding: 24,
          background: 'linear-gradient(120deg,#0c130b,#0e1a0d)', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 18, margin: '0 0 4px' }}>Grassroots Support</h3>
          <div style={{ fontSize: 13, color: '#cfd4cf', marginBottom: 8 }}>&ldquo;KLEVERR&rdquo; Latvian League</div>
          <p style={{ fontSize: 13, color: '#9aa39a', margin: '0 0 18px', maxWidth: 230 }}>We&apos;ve been proud supporter of biggest esports league in Latvia</p>
          <button onClick={() => go('cases')} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 13,
            color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none',
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}>Open Cases</button>
          <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            width: 120, height: 120, borderRadius: 14,
            backgroundImage: 'repeating-linear-gradient(135deg,rgba(120,200,120,.10) 0 8px,transparent 8px 16px)',
            border: '1px solid rgba(95,213,95,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5c6b5c' }}>logo</span>
          </div>
        </div>
        <div style={{ border: '1px solid rgba(230,120,60,.25)', borderRadius: 16, padding: 24,
          background: 'linear-gradient(120deg,#140d09,#1a100b)', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 18, margin: '0 0 4px' }}>Team Support</h3>
          <div style={{ fontSize: 13, color: '#cfd4cf', marginBottom: 8 }}>EC BANGA</div>
          <p style={{ fontSize: 13, color: '#9aa39a', margin: '0 0 18px', maxWidth: 230 }}>We&apos;ve been proud supporter of biggest esports league in Latvia</p>
          <button onClick={() => go('cases')} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 13,
            color: '#fff', background: 'linear-gradient(160deg,#e8843e,#cc5a22)', border: 'none',
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}>Open Cases</button>
          <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            width: 150, height: 120, borderRadius: 14,
            backgroundImage: 'repeating-linear-gradient(135deg,rgba(230,140,80,.10) 0 8px,transparent 8px 16px)',
            border: '1px solid rgba(230,120,60,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7a5c4c' }}>team photo</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 26,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        background: '#0b0e0a', flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 380 }}>
          <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 22, margin: '0 0 8px' }}>
            We Made It <span style={{ color: '#5fd75f' }}>Together</span>
          </h3>
          <p style={{ fontSize: 13, color: '#9aa39a', margin: '0 0 18px' }}>
            From Day 1 we at SkinMaze have awarded our users with bonuses, promo codes and freebies. Be part of our SkinMaze community
          </p>
          <button onClick={() => flash('Coming soon ✨')} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600,
            fontSize: 13, color: '#cfd4cf', background: '#0e120e', border: '1px solid rgba(255,255,255,.12)',
            padding: '10px 18px', borderRadius: 10, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            💬 Join our Discord
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 44px' }}>
          {[
            { n: platformStats ? platformStats.totalPlayers.toLocaleString() : '—', l: 'Players' },
            { n: platformStats ? platformStats.onlinePlayers.toLocaleString() : '—', l: 'Online' },
            { n: platformStats ? platformStats.casesOpened.toLocaleString()  : '—', l: 'Opened Cases' },
            { n: '24/7', l: 'Support' },
          ].map(({ n, l }) => (
            <div key={l}>
              <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 22, color: '#5fd75f' }}>{n}</div>
              <div style={{ fontSize: 12, color: '#9aa39a' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
