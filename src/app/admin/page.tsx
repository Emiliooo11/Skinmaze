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
      <AdminPage />
    </div>
  );
}
