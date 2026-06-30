'use client';
import { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { SOCIALS, FOOTER_COLS } from '@/app/lib/data';
import { t, LANGUAGES } from '@/app/lib/i18n';

export function Footer() {
  const { go, flash, lang, setLang } = useStore();
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

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
            {t('footer_owned', lang)}<br />AASFAF Varna, Bulgaria<br />
            <strong style={{ color: '#aeb6ae' }}>{t('footer_powered', lang)}</strong>
          </p>
          <p style={{ fontSize: 12, color: '#7a827a', marginTop: 18 }}>{t('footer_copyright', lang)}</p>
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
            {t('footer_support', lang)}
          </button>

          {/* Language picker */}
          <div style={{ position: 'relative', width: '100%' }}>
            <button onClick={() => setLangOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8,
              fontWeight: 500, fontSize: 13, color: '#cfd4cf',
              background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', padding: '11px 18px',
              borderRadius: 10, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
              <img src="/flag-lv.png" alt="LV" style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2, display: lang === 'lv' ? 'block' : 'none' }} />
              <span style={{ fontSize: 15 }}>{lang !== 'lv' ? currentLang.flag : ''}</span>
              {currentLang.label}
              <span style={{ color: '#6b746b', marginLeft: 'auto' }}>◂</span>
            </button>
            {langOpen && (
              <div style={{ position: 'absolute', bottom: '110%', left: 0, right: 0, background: '#0e120e',
                border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, overflow: 'hidden', zIndex: 50 }}>
                {LANGUAGES.map(l => (
                  <div key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                      cursor: 'pointer', fontSize: 13, color: lang === l.code ? '#7fe877' : '#cfd4cf',
                      background: lang === l.code ? 'rgba(95,213,95,.08)' : 'transparent' }}>
                    {l.code === 'lv'
                      ? <img src="/flag-lv.png" alt="LV" style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} />
                      : <span style={{ fontSize: 16 }}>{l.flag}</span>}
                    {l.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
