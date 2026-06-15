'use client';
import { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { verifyRoll } from '@/app/lib/provablyFair';
import { RAR } from '@/app/lib/data';

export function FairnessModal() {
  const {
    fairnessOpen, closeFairness,
    serverSeedHash, nextServerSeedHash,
    clientSeed, setClientSeed,
    nonce, spinHistory,
    rotateSeed,
  } = useStore();

  const [verifyServer, setVerifyServer] = useState('');
  const [verifyClient, setVerifyClient] = useState('');
  const [verifyNonce, setVerifyNonce] = useState('0');
  const [verifyResult, setVerifyResult] = useState<{ roll: number; rar: string; item: string; hash: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  if (!fairnessOpen) return null;

  async function handleVerify() {
    if (!verifyServer || !verifyClient) return;
    setVerifying(true);
    try {
      const res = await verifyRoll(verifyServer, verifyClient, parseInt(verifyNonce, 10) || 0);
      setVerifyResult({ ...res, rar: RAR[res.rar]?.n || res.rar });
    } catch {
      setVerifyResult(null);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(4,6,4,.88)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '80px 24px 40px', overflowY: 'auto' }}>
      <div className="anim-pop" style={{ width: 'min(680px,95vw)', background: '#0d1014',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: 28,
        boxShadow: '0 40px 100px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 18 }}>Provably Fair</div>
            <div style={{ fontSize: 13, color: '#9aa39a', marginTop: 2 }}>Every spin is verifiable on-chain using HMAC-SHA256</div>
          </div>
          <button onClick={closeFairness} style={{ width: 36, height: 36, borderRadius: 10, background: '#1a1f26',
            border: '1px solid rgba(255,255,255,.1)', color: '#cfd4cf', fontSize: 17, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Current Seeds */}
        <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Active Bet</div>
          <Row label="Server Seed Hash (SHA-256)" value={serverSeedHash || '—'} mono />
          <Row label="Next Server Seed Hash" value={nextServerSeedHash || '—'} mono />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 5 }}>Client Seed</div>
              <input
                value={clientSeed}
                onChange={e => setClientSeed(e.target.value)}
                style={{ width: '100%', background: '#10140f', border: '1px solid rgba(255,255,255,.12)', borderRadius: 9,
                  padding: '10px 14px', color: '#e8ece8', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 5 }}>Nonce</div>
              <div style={{ background: '#10140f', border: '1px solid rgba(255,255,255,.12)', borderRadius: 9,
                padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#7fe877', minWidth: 60, textAlign: 'center' }}>{nonce}</div>
            </div>
          </div>
          <button onClick={rotateSeed} style={{ marginTop: 14, width: '100%', fontFamily: 'var(--font-outfit)', fontWeight: 700,
            fontSize: 14, border: '1px solid rgba(95,213,95,.3)', borderRadius: 10, padding: '11px 0',
            background: 'rgba(95,213,95,.08)', color: '#7fe877', cursor: 'pointer' }}>
            Rotate Seeds — reveals current server seed
          </button>
        </div>

        {/* How it works */}
        <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>How It Works</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#7fa87f', lineHeight: 1.7 }}>
            hash = HMAC-SHA256(serverSeed, &ldquo;{'{'}clientSeed{'}'}&rdquo;:{'{'}nonce{'}'})
            <br />bytes 0-7  → rarity roll [0,1)
            <br />bytes 8-15 → item within rarity pool
            <br />bytes 16-23→ price within rarity range
          </div>
        </div>

        {/* Verification tool */}
        <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Verify a Spin</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SeedInput label="Server Seed (revealed after rotation)" value={verifyServer} onChange={setVerifyServer} />
            <SeedInput label="Client Seed" value={verifyClient} onChange={setVerifyClient} />
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 5 }}>Nonce</div>
                <input value={verifyNonce} onChange={e => setVerifyNonce(e.target.value)}
                  style={{ width: '100%', background: '#10140f', border: '1px solid rgba(255,255,255,.12)', borderRadius: 9,
                    padding: '10px 14px', color: '#e8ece8', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
              </div>
            </div>
            <button onClick={handleVerify} disabled={verifying || !verifyServer || !verifyClient}
              style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a',
                background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 0',
                borderRadius: 10, cursor: 'pointer', opacity: verifying ? .6 : 1 }}>
              {verifying ? 'Verifying…' : 'Verify'}
            </button>
            {verifyResult && (
              <div style={{ background: '#0c110c', border: '1px solid rgba(95,213,95,.2)', borderRadius: 10, padding: 14 }}>
                <Row label="HMAC Hash" value={verifyResult.hash.slice(0, 32) + '…'} mono />
                <Row label="Roll" value={verifyResult.roll.toFixed(8)} mono />
                <Row label="Rarity" value={verifyResult.rar} />
                <Row label="Item" value={verifyResult.item} />
              </div>
            )}
          </div>
        </div>

        {/* Spin History */}
        {spinHistory.length > 0 && (
          <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Recent Spins</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
              {spinHistory.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center',
                  padding: '9px 12px', background: '#0e120e', borderRadius: 9, border: '1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#4a7a4a' }}>#{r.nonce}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{r.item}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#4a7a4a', marginTop: 2 }}>{r.hash.slice(0, 24)}…</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#7fe877', fontWeight: 600 }}>{r.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.05)', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#9aa39a', flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: 11, color: '#cfd4cf', wordBreak: 'break-all', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function SeedInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#9aa39a', marginBottom: 5 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="paste here…"
        style={{ width: '100%', background: '#10140f', border: '1px solid rgba(255,255,255,.12)', borderRadius: 9,
          padding: '10px 14px', color: '#e8ece8', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
    </div>
  );
}
