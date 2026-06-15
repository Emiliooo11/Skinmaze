'use client';
export function RarityBar({ left = '14%' }: { left?: string }) {
  return (
    <div style={{ position: 'relative', height: 5, borderRadius: 3, margin: '12px 0 10px',
      background: 'linear-gradient(90deg,#39d44e,#9bd24a 35%,#e0c23a 60%,#e08a3a 80%,#e34a4a)' }}>
      <div style={{ position: 'absolute', left, top: -2, width: 3, height: 9, borderRadius: 2, background: '#fff' }} />
    </div>
  );
}
