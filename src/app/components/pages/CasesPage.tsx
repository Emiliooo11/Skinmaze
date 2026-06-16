'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';
import { buildCasesAll, CASE_TABS, CaseItem } from '@/app/lib/data';
import { fetchCases } from '@/app/lib/db';
import { usdToCoins, fmtCoins } from '@/app/lib/currency';
import { CoinIcon } from '../CoinIcon';
import { Placeholder } from '../Placeholder';
import { RarityBar } from '../RarityBar';

function dbCasesToCaseItems(dbCases: Awaited<ReturnType<typeof fetchCases>>): CaseItem[] {
  return dbCases.map(c => ({
    id: c.id,
    name: c.name,
    price: fmtCoins(usdToCoins(c.price)),
    image: c.image_url || '/cases/case-water-camo.png',
  }));
}

const staticCases = buildCasesAll();

function tabStyle(active: boolean) {
  return {
    border: active ? '1px solid rgba(95,213,95,.5)' : '1px solid rgba(255,255,255,.08)',
    background: active ? 'rgba(95,213,95,.14)' : '#0e120e',
    color: active ? '#7fe877' : '#9aa39a',
  };
}

export function CasesPage() {
  const { flash, openCase, caseQuery, setCaseQuery, caseTab, setCaseTab, fav, setFav } = useStore();
  const [dbCases, setDbCases] = useState<CaseItem[] | null>(null);

  useEffect(() => {
    fetchCases().then(rows => {
      if (rows.length > 0) setDbCases(dbCasesToCaseItems(rows));
    });
  }, []);

  const casesAll = dbCases ?? staticCases;
  const grid = casesAll.filter(c => !caseQuery || c.name.toLowerCase().includes(caseQuery.toLowerCase()));

  return (
    <div>
      {/* Header banner */}
      <div style={{ border: '1px solid rgba(95,213,95,.18)', borderRadius: 16, padding: 30, marginBottom: 22,
        textAlign: 'center', background: 'radial-gradient(ellipse at top,rgba(95,213,95,.12),#0a0d09 70%)' }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 26, margin: '0 0 6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>🗃️ Cases</h1>
        <p style={{ margin: 0, color: '#9aa39a', fontSize: 14 }}>Unbox some of our most popular cases</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 10,
          background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px' }}>
          <span style={{ color: '#6b746b' }}>🔍</span>
          <input value={caseQuery} onChange={e => setCaseQuery(e.target.value)} placeholder="Search cases"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8ece8',
              fontFamily: 'var(--font-outfit)', fontSize: 14 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0e120e',
          border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px', color: '#9aa39a', fontSize: 14 }}>
          <CoinIcon size={14} />Min
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0e120e',
          border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '12px 16px', color: '#9aa39a', fontSize: 14 }}>
          <CoinIcon size={14} />Max
        </div>
        <div onClick={() => flash('Coming soon ✨')} style={{ display: 'flex', alignItems: 'center', gap: 8,
          background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11,
          padding: '12px 16px', color: '#9aa39a', fontSize: 14, cursor: 'pointer' }}>
          Price: <span style={{ color: '#e8ece8' }}>High to Low</span> ◂
        </div>
        <div onClick={() => setFav(!fav)} style={{ display: 'flex', alignItems: 'center', gap: 10,
          background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11,
          padding: '12px 16px', color: '#cfd4cf', fontSize: 14, cursor: 'pointer' }}>
          ❤️ Favorite
          <span style={{ width: 34, height: 18, borderRadius: 10, background: fav ? '#46c041' : '#1e241e',
            position: 'relative', transition: 'background .15s', display: 'inline-block', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 2, left: fav ? 18 : 2, width: 14, height: 14,
              borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
          </span>
        </div>
      </div>

      {/* Collection tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, overflowX: 'auto', paddingBottom: 6 }}>
        {CASE_TABS.map(label => {
          const st = tabStyle(caseTab === label);
          return (
            <span key={label} onClick={() => setCaseTab(label)}
              style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 9,
                fontSize: 13, fontWeight: 500, cursor: 'pointer', ...st }}>
              {label}
            </span>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
        {grid.map(c => (
          <div key={c.id} onClick={() => openCase(c)}
            style={{ background: '#0c0f0b', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 18,
              cursor: 'pointer', transition: 'transform .14s, border-color .14s, box-shadow .14s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-5px)'; el.style.borderColor = 'rgba(95,213,95,.45)'; el.style.boxShadow = '0 14px 30px rgba(0,0,0,.4)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.borderColor = 'rgba(255,255,255,.06)'; el.style.boxShadow = ''; }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
              <img src={c.image} alt={c.name} style={{ height: 150, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.6))' }} />
            </div>
            <RarityBar />
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-poppins)', fontWeight: 600, fontSize: 15 }}>{c.name}</div>
            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, fontSize: 13, color: '#cfd4cf' }}>
              <CoinIcon size={14} />{c.price}
            </div>
          </div>
        ))}
      </div>

      {grid.length === 0 && (
        <div style={{ textAlign: 'center', color: '#6b746b', padding: 50, fontSize: 14 }}>No cases match your search.</div>
      )}
    </div>
  );
}
