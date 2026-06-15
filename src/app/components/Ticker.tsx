'use client';
import { useStore } from '@/app/store/useStore';
import { TICKER_COLORS } from '@/app/lib/data';

export function Ticker() {
  const { go, flash } = useStore();
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, padding: '0 0 0 22px',
      marginBottom: 18, position: 'relative', zIndex: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingRight: 14, flexShrink: 0 }}>
        <div onClick={() => go('cases')} style={{ width: 44, height: 44, borderRadius: 10,
          background: '#10140f', border: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>🎒</div>
        <div onClick={() => flash('Coming soon ✨')} style={{ width: 44, height: 44, borderRadius: 10,
          background: '#10140f', border: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#9aa39a', cursor: 'pointer' }}>🕘</div>
      </div>
      <div style={{ display: 'flex', gap: 10, overflow: 'hidden', flex: 1,
        WebkitMaskImage: 'linear-gradient(90deg,#000 92%,transparent)' }}>
        {TICKER_COLORS.map((color, i) => (
          <div key={i} onClick={() => go('market')} style={{ flex: '0 0 92px', height: 96, borderRadius: 11,
            background: '#0f130e', border: '1px solid rgba(255,255,255,.06)',
            borderTop: `2px solid ${color}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            padding: '8px 6px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: '6px 6px 24px', borderRadius: 8,
              backgroundImage: 'repeating-linear-gradient(135deg,rgba(140,120,200,.10) 0 7px,transparent 7px 14px)' }} />
            <span style={{ fontSize: 10, fontWeight: 500, color, position: 'relative' }}>Pandora Box</span>
          </div>
        ))}
      </div>
    </div>
  );
}
