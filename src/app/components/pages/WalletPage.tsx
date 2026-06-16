'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';
import { CoinIcon } from '../CoinIcon';

const COINS_PER_EUR = 1.75;

const EUR_CHIPS = [10, 25, 50, 100, 250, 500];

type Method = 'card' | 'skins' | 'crypto' | 'gift';

const METHODS: { key: Method; img: string | null }[] = [
  { key: 'card',   img: '/wallet-cards.png' },
  { key: 'skins',  img: '/wallet-skins.png' },
  { key: 'crypto', img: '/wallet-crypto.png' },
  { key: 'gift',   img: null },
];

function coins(eur: number) { return (eur * COINS_PER_EUR).toFixed(2); }
function fmt(n: number)     { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export function WalletPage() {
  const { walletView, setWalletView, flash, user } = useStore();
  const [method, setMethod] = useState<Method>('card');
  const [eurAmt, setEurAmt] = useState(50);
  const [btcInput, setBtcInput] = useState('');
  const [btcEurRate, setBtcEurRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);

  // Fetch live BTC/EUR when crypto is selected
  useEffect(() => {
    if (method !== 'crypto' || walletView !== 'amount') return;
    setLoadingRate(true);
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur')
      .then(r => r.json())
      .then(d => { setBtcEurRate(d?.bitcoin?.eur ?? null); })
      .catch(() => {})
      .finally(() => setLoadingRate(false));
  }, [method, walletView]);

  function openMethod(m: Method) {
    setMethod(m);
    setWalletView('amount');
  }

  const btcEur  = btcInput && btcEurRate ? parseFloat(btcInput) * btcEurRate : 0;
  const btcCoins = btcEur * COINS_PER_EUR;

  const balance = user?.balance ?? 0;

  return (
    <div>
      {/* ── Methods view ── */}
      {walletView === 'methods' && (
        <div>
          {/* Affiliate code banner */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16,
            border: '1px solid rgba(95,213,95,.18)', padding: '26px 30px', marginBottom: 26,
            background: 'radial-gradient(ellipse at 30% top,rgba(95,213,95,.12),#0a0d09 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 22 }}>Apply Affiliate Code</div>
              <div style={{ fontSize: 13, color: '#9aa39a', marginTop: 4 }}>Enter your code to get bonus coins</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input placeholder="Code" style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10, padding: '13px 18px', color: '#cfd4cf', fontFamily: 'var(--font-outfit)', outline: 'none', width: 280 }} />
              <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 700, color: '#06270a',
                background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '0 26px', borderRadius: 10, cursor: 'pointer' }}>Apply</button>
            </div>
          </div>

          {/* Rate info */}
          <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
            <span style={{ color: '#46c041', fontWeight: 700 }}>€1.00 EUR</span>
            {' = '}
            <CoinIcon size={12} />
            {' '}
            <span style={{ color: '#e8ece8', fontWeight: 700 }}>{COINS_PER_EUR.toFixed(2)} coins</span>
          </div>

          {/* Method cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {METHODS.map(m => (
              m.img ? (
                <div key={m.key} onClick={() => openMethod(m.key)}
                  style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.01)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                  <img src={m.img} alt="" style={{ width: '100%', display: 'block' }} />
                </div>
              ) : (
                <div key={m.key} style={{ borderRadius: 16, overflow: 'hidden', minHeight: 180,
                  background: '#0d100c', border: '1px solid rgba(255,255,255,.06)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 26 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Gift Cards</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>Powered by Payabl</div>
                    </div>
                    <button onClick={() => openMethod('gift')} style={{ fontWeight: 700, fontSize: 13, border: 'none',
                      borderRadius: 10, padding: '11px 18px', cursor: 'pointer', whiteSpace: 'nowrap',
                      background: '#e6c33e', color: '#241c04' }}>Buy Gift Cards</button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* ── Amount view ── */}
      {walletView === 'amount' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div onClick={() => setWalletView('methods')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#9aa39a', fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
            ‹ Back to Wallet
          </div>

          {/* Balance summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#0a0d0a',
              border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '14px 18px', fontWeight: 600 }}>
              <CoinIcon size={16} />{fmt(balance)} coins
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0a0d0a',
              border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '14px 18px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>
              <span style={{ color: '#46c041' }}>€1</span> = <CoinIcon size={14} /> <span style={{ color: '#e8ece8' }}>{COINS_PER_EUR} coins</span>
            </div>
          </div>

          {/* ── CARD ── */}
          {method === 'card' && (
            <>
              <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Card Deposit</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Select amount in EUR — coins are credited instantly</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                {EUR_CHIPS.map(v => (
                  <div key={v} onClick={() => setEurAmt(v)} style={{
                    borderRadius: 12, padding: '16px 12px', cursor: 'pointer', textAlign: 'center',
                    background: eurAmt === v ? 'rgba(95,213,95,.14)' : '#0e120e',
                    border: `1px solid ${eurAmt === v ? 'rgba(95,213,95,.5)' : 'rgba(255,255,255,.08)'}`,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: eurAmt === v ? '#7fe877' : '#e8ece8' }}>€{v}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      <CoinIcon size={11} />{coins(v)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12,
                padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9aa39a', fontSize: 14 }}>You will receive</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 18 }}>
                  <CoinIcon size={16} />{coins(eurAmt)} coins
                </span>
              </div>
              <button onClick={() => flash(`Deposit of €${eurAmt} → ${coins(eurAmt)} coins submitted ✅`)}
                style={{ width: '100%', fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15,
                  color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none',
                  padding: 16, borderRadius: 12, cursor: 'pointer' }}>
                Deposit €{eurAmt} → {coins(eurAmt)} coins
              </button>
            </>
          )}

          {/* ── CRYPTO (BTC) ── */}
          {method === 'crypto' && (
            <>
              <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Bitcoin Deposit</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Enter BTC amount — converted to EUR then to coins</div>

              {/* Live rate */}
              <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12,
                padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9aa39a', fontSize: 13 }}>Live BTC/EUR rate</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#f59e0b' }}>
                  {loadingRate ? 'Loading…' : btcEurRate ? `€${btcEurRate.toLocaleString()}` : '—'}
                </span>
              </div>

              {/* BTC input */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>BTC Amount</label>
                <input
                  type="number" step="0.00001" min="0"
                  value={btcInput}
                  onChange={e => setBtcInput(e.target.value)}
                  placeholder="0.00100"
                  style={{ width: '100%', boxSizing: 'border-box', background: '#1a1d24',
                    border: '1px solid rgba(255,255,255,.1)', borderRadius: 10,
                    padding: '14px 16px', color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 16, outline: 'none' }}
                />
              </div>

              {/* Conversion breakdown */}
              {btcInput && btcEurRate && (
                <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12,
                  padding: '16px 20px', marginBottom: 24 }}>
                  <Row label="BTC" value={`₿ ${parseFloat(btcInput).toFixed(5)}`} />
                  <Row label="EUR value" value={`€ ${fmt(btcEur)}`} color="#f59e0b" />
                  <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', margin: '10px 0' }} />
                  <Row label="You receive" value={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CoinIcon size={14} />{fmt(btcCoins)} coins
                    </span>
                  } color="#7fe877" bold />
                </div>
              )}

              <button
                disabled={!btcInput || !btcEurRate || parseFloat(btcInput) <= 0}
                onClick={() => flash(`BTC deposit of ₿${btcInput} → €${fmt(btcEur)} → ${fmt(btcCoins)} coins submitted ✅`)}
                style={{ width: '100%', fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15,
                  color: (!btcInput || !btcEurRate) ? '#4b5563' : '#06270a',
                  background: (!btcInput || !btcEurRate) ? 'rgba(255,255,255,.06)' : 'linear-gradient(160deg,#74e36b,#46c041)',
                  border: 'none', padding: 16, borderRadius: 12,
                  cursor: (!btcInput || !btcEurRate) ? 'not-allowed' : 'pointer' }}>
                Deposit Bitcoin
              </button>
            </>
          )}

          {/* ── SKINS ── */}
          {method === 'skins' && (
            <>
              <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>CS2 Skin Deposit</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                Trade your skins to our bot. Skin value is assessed in EUR — coins are credited at <strong style={{ color: '#46c041' }}>€1 = {COINS_PER_EUR} coins</strong>.
              </div>
              <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
                <ExRow label="Skin value" example="e.g. €25.00" />
                <ExRow label="× exchange rate" example={`× ${COINS_PER_EUR}`} />
                <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', margin: '10px 0' }} />
                <ExRow label="Coins credited" example="= 43.75 coins" color="#7fe877" bold />
              </div>
              <div style={{ fontSize: 13, color: '#9aa39a', lineHeight: 1.7, marginBottom: 24 }}>
                Example: A skin worth <span style={{ color: '#f59e0b' }}>€50</span> will credit you <span style={{ color: '#7fe877' }}>{coins(50)} coins</span>.
              </div>
              <button onClick={() => flash('Skin deposit coming soon ✨')}
                style={{ width: '100%', fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15,
                  color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none',
                  padding: 16, borderRadius: 12, cursor: 'pointer' }}>
                Start Skin Deposit
              </button>
            </>
          )}

          {/* ── GIFT ── */}
          {method === 'gift' && (
            <>
              <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Gift Cards</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                Redeem a gift card. Value is applied in EUR at <strong style={{ color: '#46c041' }}>€1 = {COINS_PER_EUR} coins</strong>.
              </div>
              <input placeholder="Enter gift card code" style={{ width: '100%', boxSizing: 'border-box', background: '#1a1d24',
                border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '14px 16px',
                color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 14, outline: 'none', marginBottom: 16 }} />
              <button onClick={() => flash('Coming soon ✨')}
                style={{ width: '100%', fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15,
                  color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none',
                  padding: 16, borderRadius: 12, cursor: 'pointer' }}>
                Redeem Gift Card
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color, bold }: { label: string; value: React.ReactNode; color?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: bold ? 700 : 500, color: color ?? '#e8ece8' }}>{value}</span>
    </div>
  );
}

function ExRow({ label, example, color, bold }: { label: string; example: string; color?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: bold ? 700 : 500, color: color ?? '#9aa39a' }}>{example}</span>
    </div>
  );
}
