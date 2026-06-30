'use client';
import { Component, ReactNode } from 'react';
import { AdminPage } from '@/app/components/pages/AdminPage';

class AdminErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100vh', color: '#e8ece8' }}>
          <div style={{ color: '#eb4b4b', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Admin page crashed</div>
          <div style={{ color: '#e6c33e', marginBottom: 8, fontSize: 14 }}>{this.state.error.message}</div>
          <pre style={{ color: '#9aa39a', fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {this.state.error.stack}
          </pre>
          <button onClick={() => this.setState({ error: null })}
            style={{ marginTop: 24, padding: '10px 24px', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminPortal() {
  return (
    <AdminErrorBoundary>
      <div style={{ fontFamily: 'var(--font-outfit),sans-serif', background: '#080a08',
        color: '#e8ece8', minHeight: '100vh', overflowX: 'hidden' }}>
        <AdminPage />
      </div>
    </AdminErrorBoundary>
  );
}
