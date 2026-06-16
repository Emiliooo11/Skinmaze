'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';

type Tab = 'signup' | 'signin';

export function LoginModal() {
  const { loginOpen, closeLogin } = useStore();
  const [tab, setTab] = useState<Tab>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loginOpen) {
      setFullName(''); setEmail(''); setAgreeTerms(false); setAgreeAge(false); setErrors({});
    }
  }, [loginOpen]);

  if (!loginOpen) return null;

  function handleSteam() {
    if (tab === 'signup') {
      const errs: Record<string, string> = {};
      if (!fullName.trim()) errs.fullName = 'Required';
      if (!email.trim() || !email.includes('@')) errs.email = 'Valid email required';
      if (!agreeTerms) errs.terms = 'Please accept the Terms of Service';
      if (!agreeAge) errs.age = 'You must be 18 or older';
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }
    const params = new URLSearchParams({ name: fullName.trim(), email: email.trim() });
    window.location.href = `/api/auth/steam?${params}`;
  }

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    background: '#1a1d24', border: `1px solid ${err ? '#ef4444' : 'rgba(255,255,255,.1)'}`,
    borderRadius: 8, padding: '13px 16px', color: '#e8ece8',
    fontFamily: 'var(--font-outfit)', fontSize: 14, outline: 'none',
  });

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) closeLogin(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.80)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        display: 'flex', width: '100%', maxWidth: 880, borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,.7)', position: 'relative',
      }}>
        {/* Close */}
        <button onClick={closeLogin} style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.12)',
          color: '#fff', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        {/* Left — mascot */}
        <div style={{ width: 380, flexShrink: 0, position: 'relative', overflow: 'hidden', minHeight: 520, background: '#0d1117' }}>
          <img src="/login-mascot.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          <div style={{ position: 'absolute', top: 20, left: 20 }}>
            <img src="/logo.png" alt="SKIN MAZE" style={{ height: 26, width: 'auto', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.7))' }} />
          </div>
        </div>

        {/* Right — form */}
        <div style={{ flex: 1, background: '#13161c', padding: '32px 36px 28px', display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#1a1d24', borderRadius: 10, padding: 4, marginBottom: 28, gap: 4 }}>
            {(['signup', 'signin'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setErrors({}); }} style={{
                flex: 1, padding: '10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14,
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#0d0f14' : '#6b7280',
                transition: 'all .15s',
              }}>
                {t === 'signup' ? 'Sign Up' : 'Sign In'}
              </button>
            ))}
          </div>

          {tab === 'signup' ? (
            <>
              {/* Full Name */}
              <div style={{ marginBottom: 14 }}>
                <input
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setErrors(r => ({ ...r, fullName: '' })); }}
                  placeholder="Full Name"
                  style={inputStyle(errors.fullName)}
                />
                {errors.fullName && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.fullName}</div>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: 24 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(r => ({ ...r, email: '' })); }}
                  placeholder="Email"
                  style={inputStyle(errors.email)}
                />
                {errors.email && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
              </div>

              {/* Checkboxes */}
              <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <Checkbox checked={agreeTerms} error={!!errors.terms}
                      onChange={() => { setAgreeTerms(v => !v); setErrors(r => ({ ...r, terms: '' })); }} />
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>
                      I agree to the{' '}
                      <span style={{ color: '#5fd75f', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
                      {' '}and{' '}
                      <span style={{ color: '#5fd75f', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
                    </span>
                  </label>
                  {errors.terms && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, marginLeft: 32 }}>{errors.terms}</div>}
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <Checkbox checked={agreeAge} error={!!errors.age}
                      onChange={() => { setAgreeAge(v => !v); setErrors(r => ({ ...r, age: '' })); }} />
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>I am 18 years of age or older</span>
                  </label>
                  {errors.age && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, marginLeft: 32 }}>{errors.age}</div>}
                </div>
              </div>

              {/* Steam sign up */}
              <SteamButton onClick={handleSteam} label="Sign Up with Steam" />
            </>
          ) : (
            <>
              {/* Sign in — Steam only */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, paddingBottom: 16 }}>
                <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', margin: 0 }}>
                  Sign in securely using your Steam account. No password needed.
                </p>
                <SteamButton onClick={handleSteam} label="Sign In with Steam" />
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: 11, color: '#374151', lineHeight: 1.6, marginTop: 'auto', paddingTop: 20 }}>
            All Rights Reserved. Powered by Steam. Not affiliated with Valve Corp.<br />
            Copyright © 2026 SkinMaze. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, error }: { checked: boolean; onChange: () => void; error: boolean }) {
  return (
    <div onClick={onChange} style={{
      width: 20, height: 20, flexShrink: 0, borderRadius: 5,
      border: `2px solid ${error ? '#ef4444' : checked ? '#46c041' : 'rgba(255,255,255,.2)'}`,
      background: checked ? '#46c041' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all .15s',
    }}>
      {checked && <span style={{ color: '#06270a', fontSize: 12, fontWeight: 800, lineHeight: 1 }}>✓</span>}
    </div>
  );
}

function SteamButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '14px', borderRadius: 10,
      border: '1px solid rgba(255,255,255,.1)',
      background: '#1b2838', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15, color: '#c7d5e0',
      transition: 'background .15s',
    }}>
      <svg width="20" height="20" viewBox="0 0 233 233" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M116.5 0C52.1 0 0 52.1 0 116.5c0 52.5 34.8 97 83 111.2l30.5-75.1c-10.2-4.7-17.3-15-17.3-27 0-16.4 13.3-29.7 29.7-29.7 16.4 0 29.7 13.3 29.7 29.7 0 14.7-10.7 27-24.8 29.3l-29.2 72c3.9.7 7.9 1.1 12 1.1 64.3 0 116.5-52.2 116.5-116.5C233 52.1 180.8 0 116.5 0z" fill="#c7d5e0"/>
      </svg>
      {label}
    </button>
  );
}
