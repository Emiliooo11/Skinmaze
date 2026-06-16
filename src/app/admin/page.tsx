'use client';
import { AdminPage } from '@/app/components/pages/AdminPage';

export default function AdminPortal() {
  return (
    <div style={{
      fontFamily: 'var(--font-outfit),sans-serif',
      background: '#080a08',
      color: '#e8ece8',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      {/* Admin topbar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 34px', borderBottom: '1px solid rgba(255,255,255,.06)',
        background: '#070908', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(150deg,#74e36b,#3fb13c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-poppins)', fontWeight: 800, color: '#06270a', fontSize: 14,
          }}>SM</div>
          <span style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 16, color: '#6fe267', letterSpacing: '1px' }}>
            SKINMAZE
          </span>
          <span style={{
            marginLeft: 8, background: 'rgba(95,213,95,.12)', border: '1px solid rgba(95,213,95,.25)',
            borderRadius: 6, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: '#7fe877',
          }}>ADMIN</span>
        </div>
        <a href="/" style={{ fontSize: 13, color: '#9aa39a', textDecoration: 'none' }}>
          ‹ Back to site
        </a>
      </header>

      <main style={{ maxWidth: 1320, margin: '0 auto', padding: '28px 24px 80px' }}>
        <AdminPage />
      </main>
    </div>
  );
}
