'use client';
import { useStore } from '@/app/store/useStore';
import { CoinIcon } from './CoinIcon';

export function TopBar() {
  const { route, go, login, goProfile, goWallet, logged, flash } = useStore();

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 34px', position: 'relative', zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 46 }}>
        {/* Logo */}
        <div onClick={() => go('home')} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(150deg,#74e36b,#3fb13c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-poppins)', fontWeight: 800, color: '#06270a', fontSize: 17,
            boxShadow: '0 0 18px rgba(95,213,95,.45)' }}>SM</div>
          <span style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20,
            letterSpacing: '1.5px', color: '#6fe267' }}>SKIN MAZE</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <div onClick={() => go('cases')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontWeight: 500, fontSize: 15, color: route === 'cases' ? '#7fe877' : '#cfd4cf', transition: 'color .15s' }}>
            <span>🗃️</span> Cases
          </div>
          <div onClick={() => flash('Coming soon ✨')} style={{ display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', fontWeight: 500, fontSize: 15, color: '#9aa39a' }}>
            <span>🏆</span> Leaderboard
          </div>
          <div onClick={() => go('market')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontWeight: 500, fontSize: 15, color: route === 'market' ? '#7fe877' : '#9aa39a' }}>
            <span>🛍️</span> Market
          </div>
        </nav>
      </div>

      {/* Guest buttons */}
      {!logged && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={login} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14, color: '#cfd4cf',
            background: 'transparent', border: '1px solid rgba(255,255,255,.12)', padding: '11px 22px',
            borderRadius: 11, cursor: 'pointer' }}>Alt Login</button>
          <button onClick={login} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a',
            background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 24px',
            borderRadius: 11, cursor: 'pointer', boxShadow: '0 6px 18px rgba(95,213,95,.3)' }}>Login/Register</button>
        </div>
      )}

      {/* Logged-in user bar */}
      {logged && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Balance */}
          <div onClick={goWallet} title="Wallet" style={{ display: 'flex', alignItems: 'center', gap: 9,
            background: '#10140f', border: '1px solid rgba(255,255,255,.08)', padding: '9px 16px',
            borderRadius: 11, cursor: 'pointer' }}>
            <CoinIcon size={18} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>1,343.09</span>
            <span style={{ color: '#06270a', background: '#46c041', borderRadius: 6, width: 18, height: 18,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>+</span>
          </div>
          {/* Marketplace shortcut */}
          <button onClick={() => go('market')} style={{ width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            boxShadow: '0 5px 14px rgba(95,213,95,.3)' }}>🛍️</button>
          {/* Notifications */}
          <button onClick={() => flash('Coming soon ✨')} style={{ width: 40, height: 40, borderRadius: 10,
            background: '#10140f', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer',
            position: 'relative', color: '#cfd4cf', fontSize: 16 }}>
            🔔
            <span style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: '50%',
              background: '#5fd75f', boxShadow: '0 0 6px #5fd75f' }} />
          </button>
          {/* Avatar / Profile */}
          <div onClick={() => goProfile()} style={{ display: 'flex', alignItems: 'center', gap: 9,
            background: '#10140f', border: '1px solid rgba(255,255,255,.08)', padding: '6px 12px 6px 6px',
            borderRadius: 11, cursor: 'pointer' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg,#3a5cff,#8847ff)', display: 'inline-block' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 14, color: '#5fd75f' }}>
              <span style={{ fontSize: 11 }}>🎮</span> whoisfrnz
            </span>
            <span style={{ color: '#6b746b', fontSize: 11 }}>▾</span>
          </div>
        </div>
      )}
    </header>
  );
}
