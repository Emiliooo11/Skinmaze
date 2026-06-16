'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';

type Tab = 'signup' | 'signin';

export function LoginModal() {
  const { loginOpen, closeLogin } = useStore();
  const [tab, setTab] = useState<Tab>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loginOpen) {
      setTab('signup'); setUsername(''); setEmail(''); setPassword('');
      setAgreeTerms(false); setAgreeAge(false); setErrors({});
    }
  }, [loginOpen]);

  if (!loginOpen) return null;

  const canSubmit = email.trim() && password.trim() && (tab === 'signin' || (agreeTerms && agreeAge));

  function handleSubmit() {
    const errs: Record<string, string> = {};
    if (tab === 'signup' && !username.trim()) errs.username = 'Required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email required';
    if (!password.trim()) errs.password = 'Required';
    if (tab === 'signup' && !agreeTerms) errs.terms = 'Required';
    if (tab === 'signup' && !agreeAge) errs.age = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // TODO: email/password auth
  }

  function handleSteam() {
    const params = new URLSearchParams({ name: username.trim(), email: email.trim() });
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
        <div style={{
          width: 380, flexShrink: 0, position: 'relative', overflow: 'hidden', minHeight: 580,
          background: '#0d1117',
        }}>
          <img src="/login-mascot.png" alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block',
          }} />
          {/* Overlay logo */}
          <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'linear-gradient(150deg,#74e36b,#3fb13c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-poppins)', fontWeight: 900, color: '#06270a', fontSize: 16,
              boxShadow: '0 0 18px rgba(95,213,95,.5)',
            }}>SM</div>
            <span style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 22,
              letterSpacing: '1.5px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.6)' }}>
              SKIN MAZE
            </span>
          </div>
        </div>

        {/* Right — form */}
        <div style={{
          flex: 1, background: '#13161c', padding: '32px 36px 28px',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: '#1a1d24', borderRadius: 10,
            padding: 4, marginBottom: 28, gap: 4,
          }}>
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

          {/* Username (sign up only) */}
          {tab === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setErrors(r => ({ ...r, username: '' })); }}
                placeholder="Enter name"
                style={inputStyle(errors.username)}
              />
              {errors.username && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.username}</div>}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(r => ({ ...r, email: '' })); }}
              placeholder="Enter mail"
              style={inputStyle(errors.email)}
            />
            {errors.email && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(r => ({ ...r, password: '' })); }}
              placeholder="Enter your password"
              style={inputStyle(errors.password)}
            />
            {errors.password && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.password}</div>}
          </div>

          {/* Checkboxes (sign up only) */}
          {tab === 'signup' && (
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <Checkbox checked={agreeAge} error={!!errors.age}
                  onChange={() => { setAgreeAge(v => !v); setErrors(r => ({ ...r, age: '' })); }} />
                <span style={{ fontSize: 13, color: '#9ca3af' }}>I am 18 years of age of older</span>
              </label>
            </div>
          )}

          {/* Primary CTA */}
          <button onClick={handleSubmit} style={{
            width: '100%', padding: '15px', borderRadius: 10, border: 'none',
            fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            background: canSubmit ? 'linear-gradient(160deg,#74e36b,#46c041)' : 'rgba(255,255,255,.06)',
            color: canSubmit ? '#06270a' : '#4b5563',
            marginBottom: 16, transition: 'all .15s',
          }}>
            {tab === 'signup' ? 'Agree and Sign Up' : 'Sign In'}
          </button>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
            <span style={{ fontSize: 13, color: '#4b5563' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
          </div>

          {/* Steam button */}
          <button onClick={handleSteam} style={{
            width: '100%', padding: '13px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,.1)',
            background: '#1b2838', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14, color: '#c7d5e0',
            marginBottom: 10, transition: 'background .15s',
          }}>
            <svg width="18" height="18" viewBox="0 0 233 233" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M116.5 0C52.1 0 0 52.1 0 116.5c0 52.5 34.8 97 83 111.2l30.5-75.1c-10.2-4.7-17.3-15-17.3-27 0-16.4 13.3-29.7 29.7-29.7 16.4 0 29.7 13.3 29.7 29.7 0 14.7-10.7 27-24.8 29.3l-29.2 72c3.9.7 7.9 1.1 12 1.1 64.3 0 116.5-52.2 116.5-116.5C233 52.1 180.8 0 116.5 0z" fill="#c7d5e0"/>
            </svg>
            Steam
          </button>

          {/* Google button */}
          <button onClick={() => {}} style={{
            width: '100%', padding: '13px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,.1)',
            background: '#1a1d24', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14, color: '#e8ece8',
            marginBottom: 20,
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.6 0 6.6 5.5 2.7 13.5l7.8 6C12.4 13.2 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
              <path fill="#FBBC05" d="M10.5 28.5c-.5-1.5-.8-3.2-.8-4.5s.3-3 .8-4.5l-7.8-6C1 16.5 0 20.1 0 24s1 7.5 2.7 10.5l7.8-6z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.3-7.7 2.3-6.2 0-11.5-4.2-13.4-9.9l-7.8 6C6.6 42.5 14.6 48 24 48z"/>
            </svg>
            Google
          </button>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: 11, color: '#374151', lineHeight: 1.6, marginTop: 'auto' }}>
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
