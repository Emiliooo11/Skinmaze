'use client';
interface Props {
  label?: string;
  height?: number;
  color?: string;
  style?: React.CSSProperties;
}
export function Placeholder({ label = 'render', height = 120, color = 'rgba(120,180,120,.06)', style }: Props) {
  return (
    <div style={{
      height, borderRadius: 10,
      backgroundImage: `repeating-linear-gradient(135deg,${color} 0 9px,transparent 9px 18px)`,
      border: '1px solid rgba(255,255,255,.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#566355' }}>{label}</span>
    </div>
  );
}
