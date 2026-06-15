'use client';
import { useStore } from '@/app/store/useStore';

export function Toast() {
  const toast = useStore(s => s.toast);
  if (!toast) return null;
  return (
    <div className="anim-rise" style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      zIndex: 120, background: '#11160f', border: '1px solid rgba(95,213,95,.35)', color: '#e8ece8',
      padding: '13px 22px', borderRadius: 12, fontSize: 14, boxShadow: '0 12px 30px rgba(0,0,0,.5)',
      whiteSpace: 'nowrap' }}>
      {toast}
    </div>
  );
}
