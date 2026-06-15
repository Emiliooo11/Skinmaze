'use client';
export function CoinIcon({ size = 14 }: { size?: number }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%,#ffe07a,#d99a1e)',
        display: 'inline-block', flexShrink: 0,
      }}
    />
  );
}
