'use client';
import { usePathname } from 'next/navigation';
import { useStore } from '@/app/store/useStore';
import { CoinIcon } from './CoinIcon';

export function TopBar() {
  const pathname = usePathname();
  const { go, openLogin, goProfile, goWallet, logged, flash, user, logout } = useStore();

  const onCases  = pathname === '/cases' || pathname.startsWith('/cases/');
  const onMarket = pathname === '/market';

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 34px', position: 'relative', zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 46 }}>
        {/* Logo */}
        <div onClick={() => go('home')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="SKIN MAZE" style={{ height: 32, width: 'auto', display: 'block' }} />
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <div onClick={() => go('cases')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontWeight: 500, fontSize: 15, color: onCases ? '#7fe877' : '#cfd4cf', transition: 'color .15s' }}>
            <img src="/nav-cases.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', opacity: onCases ? 1 : 0.6 }} /> Cases
          </div>
          <div onClick={() => flash('Coming soon ✨')} style={{ display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', fontWeight: 500, fontSize: 15, color: '#9aa39a' }}>
            <img src="/nav-leaderboard.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.6 }} /> Leaderboard
          </div>
          <div onClick={() => go('market')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontWeight: 500, fontSize: 15, color: onMarket ? '#7fe877' : '#9aa39a' }}>
            <img src="/nav-market.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', opacity: onMarket ? 1 : 0.6 }} /> Market
          </div>
        </nav>
      </div>

      {/* Guest buttons */}
      {!logged && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={openLogin} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a',
            background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 24px',
            borderRadius: 11, cursor: 'pointer', boxShadow: '0 6px 18px rgba(95,213,95,.3)' }}>Login/Register</button>
        </div>
      )}

      {/* Logged-in user bar */}
      {logged && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div onClick={goWallet} title="Wallet" style={{ display: 'flex', alignItems: 'center', gap: 9,
            background: '#10140f', border: '1px solid rgba(255,255,255,.08)', padding: '9px 16px',
            borderRadius: 11, cursor: 'pointer' }}>
            <CoinIcon size={18} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{user?.balance.toFixed(2) ?? '0.00'}</span>
            <span style={{ color: '#06270a', background: '#46c041', borderRadius: 6, width: 18, height: 18,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>+</span>
          </div>
          <button onClick={() => flash('Coming soon ✨')} style={{ width: 40, height: 40, borderRadius: 10,
            background: '#10140f', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer',
            position: 'relative', color: '#cfd4cf', fontSize: 16 }}>
            🔔
            <span style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: '50%',
              background: '#5fd75f', boxShadow: '0 0 6px #5fd75f' }} />
          </button>
          <div onClick={() => goProfile()} style={{ display: 'flex', alignItems: 'center', gap: 9,
            background: '#10140f', border: '1px solid rgba(255,255,255,.08)', padding: '6px 12px 6px 6px',
            borderRadius: 11, cursor: 'pointer' }}>
            {user?.avatar
              ? <img src={user.avatar} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }} />
              : <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#3a5cff,#8847ff)', display: 'inline-block' }} />
            }
            <span style={{ fontWeight: 500, fontSize: 14, color: '#5fd75f' }}>
              {user?.username ?? 'Player'}
            </span>
            <span style={{ color: '#6b746b', fontSize: 11 }}>▾</span>
          </div>
          <button onClick={logout} style={{ width: 36, height: 36, borderRadius: 9,
            background: '#10140f', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer',
            color: '#9aa39a', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Log out">⏻</button>
        </div>
      )}
    </header>
  );
}
