'use client';
import { useStore } from '@/app/store/useStore';
import { SOCIALS, FOOTER_COLS } from '@/app/lib/data';

export function Footer() {
  const { go, flash } = useStore();
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '40px 24px 30px',
      maxWidth: 1320, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', gap: 24 }}>

        {/* Brand column */}
        <div>
          <div onClick={() => go('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
            <img src="/logo.png" alt="SKIN MAZE" style={{ height: 32, width: 'auto' }} />
          </div>
          <p style={{ fontSize: 12, color: '#7a827a', lineHeight: 1.7, maxWidth: 280 }}>
            SkinMaze SIA is owned and operated by:<br />AASFAF Varna, Bulgaria<br />
            <strong style={{ color: '#aeb6ae' }}>Powered by Steam. Not affiliated with Valve Corp.</strong>
          </p>
          <p style={{ fontSize: 12, color: '#7a827a', marginTop: 18 }}>© Copyright 2025 | All rights reserved.</p>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {SOCIALS.map((s) => (
              <span key={s.label} onClick={() => flash('Coming soon ✨')}
                style={{ width: 32, height: 32, borderRadius: 8, background: '#11140f',
                  border: '1px solid rgba(255,255,255,.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <img src={s.icon} alt={s.label} style={{ width: 16, height: 16, objectFit: 'contain' }} />
              </span>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>{col.title}</div>
            {col.links.map((l) => (
              <div key={l} onClick={() => flash('Coming soon ✨')}
                style={{ fontSize: 13, color: '#8a928a', marginBottom: 11, cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
        ))}

        {/* Support + Language */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <button onClick={() => flash('Coming soon ✨')} style={{ display: 'flex', alignItems: 'center', gap: 8,
            fontWeight: 600, fontSize: 13, color: '#06270a',
            background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '11px 18px',
            borderRadius: 10, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            <img src="/social-discord.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
            Support 24/7
          </button>
          <button onClick={() => flash('Coming soon ✨')} style={{ display: 'flex', alignItems: 'center', gap: 8,
            fontWeight: 500, fontSize: 13, color: '#cfd4cf',
            background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', padding: '11px 18px',
            borderRadius: 10, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            <img src="/flag-lv.png" alt="LV" style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} />
            Latvian
            <span style={{ color: '#6b746b', marginLeft: 'auto' }}>◂</span>
          </button>
        </div>

      </div>
    </footer>
  );
}
