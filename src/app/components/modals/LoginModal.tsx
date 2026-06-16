'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';

export function LoginModal() {
  const { loginOpen, closeLogin } = useStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (loginOpen) {
      setFullName(''); setEmail(''); setAgreeTerms(false); setAgreeAge(false); setErrors({});
    }
  }, [loginOpen]);

  if (!loginOpen) return null;

  const canSubmit = fullName.trim() && email.trim() && agreeTerms && agreeAge;

  function handleSteamLogin() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email required';
    if (!agreeTerms) errs.terms = 'Required';
    if (!agreeAge) errs.age = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // Redirect to Steam OpenID — callback will set session and redirect to /cases
    const params = new URLSearchParams({ name: fullName.trim(), email: email.trim() });
    window.location.href = `/api/auth/steam?${params}`;
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) closeLogin(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        display: 'flex', width: '100%', maxWidth: 860, borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,.6)', position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={closeLogin}
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.15)',
            color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* Left panel — visual */}
        <div style={{
          width: 340, flexShrink: 0,
          background: 'linear-gradient(145deg, #3a5bd9 0%, #5b3fa0 50%, #7b3fa0 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 32px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Background glow circles */}
          <div style={{ position: 'absolute', top: -60, left: -60, width: 240, height: 240,
            borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
          <div style={{ position: 'absolute', bottom: -80, right: -40, width: 280, height: 280,
            borderRadius: '50%', background: 'rgba(255,140,0,.08)' }} />

          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 900, fontSize: 28,
              color: '#fff', lineHeight: 1.15, textTransform: 'uppercase', marginBottom: 8,
              textShadow: '0 2px 12px rgba(0,0,0,.4)' }}>
              Welcome Bonus
            </div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 900, fontSize: 28,
              textTransform: 'uppercase', lineHeight: 1.15, marginBottom: 20 }}>
              Claim{' '}
              <span style={{ color: '#f59e0b' }}>Free $0.50</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 14, lineHeight: 1.6, marginBottom: 28, maxWidth: 240, margin: '0 auto 28px' }}>
              Log in now and claim your <strong>$0.50 bonus</strong> – no catch, just instant cash!
            </p>
            {/* Mascot placeholder */}
            <div style={{
              width: 200, height: 220, margin: '0 auto',
              background: 'rgba(255,255,255,.07)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,.12)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,.3)',
            }}>mascot</div>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{
          flex: 1, background: '#111418', padding: '48px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 900, fontSize: 30,
              color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
              Log In
            </h2>
            <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 900, fontSize: 30,
              color: '#f59e0b', textTransform: 'uppercase', margin: '2px 0 12px', lineHeight: 1.1 }}>
              To Your Adventure
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0, fontWeight: 500 }}>
              Access your inventory, join giveaways, and keep the wins coming.
            </p>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280',
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
              Full Name
            </label>
            <input
              value={fullName}
              onChange={e => { setFullName(e.target.value); setErrors(r => ({ ...r, fullName: '' })); }}
              placeholder="John Smith"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1c2028', border: `1px solid ${errors.fullName ? '#ef4444' : 'rgba(255,255,255,.1)'}`,
                borderRadius: 10, padding: '13px 16px', color: '#e8ece8',
                fontFamily: 'var(--font-outfit)', fontSize: 14, outline: 'none',
              }}
            />
            {errors.fullName && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.fullName}</div>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280',
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(r => ({ ...r, email: '' })); }}
              placeholder="john@example.com"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1c2028', border: `1px solid ${errors.email ? '#ef4444' : 'rgba(255,255,255,.1)'}`,
                borderRadius: 10, padding: '13px 16px', color: '#e8ece8',
                fontFamily: 'var(--font-outfit)', fontSize: 14, outline: 'none',
              }}
            />
            {errors.email && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
          </div>

          {/* Confirmation text */}
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 14 }}>
            We need to make sure it is okay for you to use SkinMaze, please confirm that:
          </p>

          {/* Checkbox — Terms */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 12 }}>
            <div
              onClick={() => { setAgreeTerms(v => !v); setErrors(r => ({ ...r, terms: '' })); }}
              style={{
                width: 20, height: 20, flexShrink: 0, borderRadius: 5, marginTop: 1,
                border: `2px solid ${errors.terms ? '#ef4444' : agreeTerms ? '#f59e0b' : 'rgba(255,255,255,.2)'}`,
                background: agreeTerms ? '#f59e0b' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              {agreeTerms && <span style={{ color: '#000', fontSize: 12, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.5 }}>
              I agree to the{' '}
              <span style={{ color: '#f59e0b', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: '#f59e0b', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
            </span>
          </label>
          {errors.terms && <div style={{ fontSize: 11, color: '#ef4444', marginTop: -8, marginBottom: 8, marginLeft: 32 }}>{errors.terms}</div>}

          {/* Checkbox — Age */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 24 }}>
            <div
              onClick={() => { setAgreeAge(v => !v); setErrors(r => ({ ...r, age: '' })); }}
              style={{
                width: 20, height: 20, flexShrink: 0, borderRadius: 5, marginTop: 1,
                border: `2px solid ${errors.age ? '#ef4444' : agreeAge ? '#f59e0b' : 'rgba(255,255,255,.2)'}`,
                background: agreeAge ? '#f59e0b' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              {agreeAge && <span style={{ color: '#000', fontSize: 12, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.5 }}>
              I am 18 years of age or older
            </span>
          </label>

          {/* Steam button */}
          <button
            onClick={handleSteamLogin}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 15,
              textTransform: 'uppercase', letterSpacing: 1, cursor: canSubmit ? 'pointer' : 'not-allowed',
              background: canSubmit
                ? 'linear-gradient(160deg,#1b2838,#2a475e)'
                : 'rgba(255,255,255,.06)',
              color: canSubmit ? '#c7d5e0' : '#4b5563',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              transition: 'all .15s',
              boxShadow: canSubmit ? '0 4px 20px rgba(27,40,56,.6)' : 'none',
            }}
          >
            {/* Steam logo SVG */}
            <svg width="22" height="22" viewBox="0 0 233 233" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="116.5" cy="116.5" r="116.5" fill="#1b2838"/>
              <path d="M116.5 30C68.8 30 30 68.8 30 116.5c0 42.3 29.4 77.9 69.1 87.1l25.3-62.4c-1.4-.5-2.7-1.2-3.9-2.1-5.6-4.1-8.6-10.8-7.8-17.8 1.4-12.4 12.5-21.3 24.9-19.9 12.4 1.4 21.3 12.5 19.9 24.9-.7 6.2-3.9 11.6-8.6 15.2l-24.5 60.4C147.9 194 174.2 171.7 180.3 142.6l-38.6-16c-4.4 3.2-10.1 4.6-15.9 3.4-10-2.1-16.7-11.5-15.7-21.7 1.1-10.9 10.8-18.8 21.7-17.7 5.7.6 10.7 3.4 14.1 7.5l38.8 16.1C203 98 203 98 203 116.5 203 163.7 163.7 203 116.5 203S30 163.7 30 116.5 68.8 30 116.5 30Z" fill="#c7d5e0"/>
            </svg>
            Log In With Steam
          </button>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: '#4b5563', lineHeight: 1.6 }}>
            All Rights Reserved. Powered by Steam. Not affiliated with Valve Corp.<br />
            Copyright © 2026 SkinMaze. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
