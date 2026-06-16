'use client';
import { useStore } from '@/app/store/useStore';
import { CoinIcon } from '../CoinIcon';

const METHODS = [
  { key: 'card', title: 'Card Deposit', sub: 'Powered by Payabl', cta: 'Deposit Card', ctaBg: '#6c8cff', ctaColor: '#0a0e26', grad: 'linear-gradient(120deg,#3a2f7a,#5b3fa0)', accent: 'rgba(120,90,255,.5)' },
  { key: 'skins', title: 'CS2 Skins', sub: 'Powered by Payabl', cta: 'Deposit Skins', ctaBg: '#6c8cff', ctaColor: '#0a0e26', grad: 'linear-gradient(120deg,#3a1410,#6a1f1a)', accent: 'rgba(235,75,75,.5)' },
  { key: 'crypto', title: 'Crypto', sub: 'Powered by Payabl', cta: '30+ Methods', ctaBg: '#3ad4c4', ctaColor: '#04201d', grad: 'linear-gradient(120deg,#2a1530,#5a1f2a)', accent: 'rgba(230,120,60,.5)' },
  { key: 'gift', title: 'Gift Cards', sub: 'Powered by Payabl', cta: 'Buy Gift Cards', ctaBg: '#e6c33e', ctaColor: '#241c04', grad: '#0d100c', accent: 'rgba(255,255,255,.08)' },
];

const AMT_CHIPS = [10, 25, 50, 100, 250, 500];

export function WalletPage() {
  const { walletView, setWalletView, depositAmt, setDepositAmt, flash } = useStore();

  return (
    <div>
      {/* Methods view */}
      {walletView === 'methods' && (
        <div>
          {/* Affiliate code banner */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, border: '1px solid rgba(95,213,95,.18)', padding: '26px 30px', marginBottom: 26,
            background: 'radial-gradient(ellipse at 30% top,rgba(95,213,95,.12),#0a0d09 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 22 }}>Apply Affiliate Code</div>
              <div style={{ fontSize: 13, color: '#9aa39a', marginTop: 4 }}>Select and buy the CS2 Skins you want to have</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input placeholder="Code" style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '13px 18px', color: '#cfd4cf', fontFamily: 'var(--font-outfit)', outline: 'none', width: 280 }} />
              <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 700, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '0 26px', borderRadius: 10, cursor: 'pointer' }}>Apply</button>
            </div>
          </div>

          {/* Method cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {METHODS.map(m => (
              <div key={m.key} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', minHeight: 240, padding: 26,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: m.grad, border: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ position: 'absolute', right: 20, top: 20, width: 160, height: 120, borderRadius: 12,
                  background: 'rgba(0,0,0,.18)', backgroundImage: 'repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 9px,transparent 9px 18px)',
                  border: `1px solid ${m.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,.4)' }}>art</span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20, color: '#fff' }}>{m.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{m.sub}</div>
                  </div>
                  <button onClick={() => setWalletView('amount')} style={{ fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10,
                    padding: '11px 18px', cursor: 'pointer', whiteSpace: 'nowrap', background: m.ctaBg, color: m.ctaColor }}>{m.cta}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amount view */}
      {walletView === 'amount' && (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div onClick={() => setWalletView('methods')} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#9aa39a', fontSize: 14, cursor: 'pointer', marginBottom: 18 }}>‹ Back to Wallet</div>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 24 }}>Apply Affiliate Code</div>
            <div style={{ fontSize: 13, color: '#9aa39a', marginTop: 4 }}>Select and buy the CS2 Skins you want to have</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '14px 18px', fontWeight: 600 }}>
              <CoinIcon size={16} />1,343.09
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '14px 18px', fontWeight: 600 }}>
              <span style={{ color: '#3ad48f', fontWeight: 800 }}>$</span>1,343.09
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
            {AMT_CHIPS.map(v => (
              <div key={v} onClick={() => setDepositAmt(v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: depositAmt === v ? 'rgba(95,213,95,.14)' : '#0e120e',
                border: `1px solid ${depositAmt === v ? 'rgba(95,213,95,.5)' : 'rgba(255,255,255,.08)'}`,
                borderRadius: 11, padding: 15, fontWeight: 600, cursor: 'pointer',
                color: depositAmt === v ? '#e8ece8' : '#cfd4cf' }}>
                <CoinIcon size={15} />{v}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 13, color: '#9aa39a', marginBottom: 7 }}>First name</div>
              <input placeholder="Name" style={{ width: '100%', background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '13px 16px', color: '#cfd4cf', fontFamily: 'var(--font-outfit)', outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#9aa39a', marginBottom: 7 }}>Last name</div>
              <input placeholder="Name" style={{ width: '100%', background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '13px 16px', color: '#cfd4cf', fontFamily: 'var(--font-outfit)', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, marginBottom: 22 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: '#46c041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#06270a' }}>✓</span>
            <span style={{ fontSize: 14 }}>I am 18 years of age or older</span>
          </div>
          <button onClick={() => flash(`Deposit of ${depositAmt} coins submitted ✅`)} style={{ width: '100%', fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: 15, borderRadius: 12, cursor: 'pointer' }}>Deposit</button>
        </div>
      )}
    </div>
  );
}
