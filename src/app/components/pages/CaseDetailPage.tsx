'use client';
import { useEffect, useRef } from 'react';
import { useStore, UserInfo } from '@/app/store/useStore';
import { randItem } from '@/app/lib/data';
import { rollToItem } from '@/app/lib/provablyFair';
import { CoinIcon } from '../CoinIcon';
import { SkinImage } from '../SkinImage';

export function CaseDetailPage() {
  const { currentCase, phase, won, reel, multiplier, setMultiplier, go, flash,
    startSpin, finishSpin, closeOpen, openAgain, keepItem, sellItem,
    serverSeed, clientSeed, nonce, recordSpin, setLastSpinHash, openFairness, user, logged, openLogin } = useStore();
  const reelRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cc = currentCase || { name: 'Case', price: '15,343.09' };

  function buildReel(count: number) {
    return Array.from({ length: count }, () => randItem());
  }

  function doSpin(fast: boolean, demo = false) {
    if (phase === 'spin') return;
    if (!demo && !logged) { openLogin(); return; }
    const newReel = buildReel(60);
    const winIdx = 54;
    const dur = fast ? 1.7 : 5.6;
    const spinNonce = nonce;

    rollToItem(serverSeed, clientSeed, spinNonce).then(wonItem => {
      newReel[winIdx] = wonItem;
      startSpin(newReel, wonItem);
      setLastSpinHash(wonItem.hash);
      recordSpin({ serverSeed, clientSeed, nonce: spinNonce, hash: wonItem.hash, item: `${wonItem.w} | ${wonItem.skin}`, price: wonItem.price });
      useStore.setState(s => ({ nonce: s.nonce + 1 }));

      // Record in wagers table for live ticker (real spins only)
      if (demo) return;
      const itemPrice = parseFloat(wonItem.price.replace(/,/g, '')) || 0;
      const casePrice = parseFloat((currentCase?.price ?? '0').replace(/,/g, '')) || 0;
      fetch('/api/recent-opens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_name: currentCase?.name ?? 'Case',
          amount: casePrice,
          won_item: `${wonItem.w} | ${wonItem.skin}`,
          won_item_image: wonItem.imageUrl || null,
          won_item_color: wonItem.color || null,
          won_value: itemPrice,
          profit: itemPrice - casePrice,
          player_name: user?.username ?? 'Anonymous',
          player_avatar: user?.avatar ?? null,
        }),
      }).catch(() => {});


      if (startTimer.current) clearTimeout(startTimer.current);
      startTimer.current = setTimeout(() => {
        const vp = vpRef.current;
        const reelEl = reelRef.current;
        if (vp && reelEl) {
          const step = 176;
          const center = vp.offsetWidth / 2;
          const jitter = Math.random() * 90 - 45;
          const offset = winIdx * step + step / 2 - center + jitter;
          reelEl.style.transition = 'none';
          reelEl.style.transform = 'translateX(0px)';
          void reelEl.offsetWidth;
          reelEl.style.transition = `transform ${dur}s cubic-bezier(0.08,0.82,0.14,1)`;
          reelEl.style.transform = `translateX(${-offset}px)`;
        }
        if (spinTimer.current) clearTimeout(spinTimer.current);
        spinTimer.current = setTimeout(() => finishSpin(), dur * 1000 + 150);
      }, 70);
    });
  }

  function handleClose() {
    if (spinTimer.current) clearTimeout(spinTimer.current);
    if (startTimer.current) clearTimeout(startTimer.current);
    closeOpen();
    if (reelRef.current) { reelRef.current.style.transition = 'none'; reelRef.current.style.transform = ''; }
  }

  function handleOpenAgain() {
    handleClose();
    setTimeout(() => doSpin(false), 80);
  }

  useEffect(() => { return () => { if (spinTimer.current) clearTimeout(spinTimer.current); }; }, []);

  const displayReel = reel.length > 0 ? reel : buildReel(24);
  const multBtns = [1, 2, 3, 4];

  const dropItem = (i: number) => { const it = randItem(); return { ...it, pct: (Math.random() * 0.4 + 0.02).toFixed(2), key: 'drop' + i }; };
  const bestDrops = Array.from({ length: 8 }, (_, i) => dropItem(i));
  const itemsContains = Array.from({ length: 12 }, (_, i) => dropItem(i + 100));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', margin: '4px 0 18px' }}>
        <div onClick={() => go('cases')} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#9aa39a', fontSize: 14, cursor: 'pointer', justifySelf: 'start', whiteSpace: 'nowrap' }}>‹ Back to cases</div>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {'image' in cc && (cc as any).image && (
            <img src={(cc as any).image} alt={cc.name} style={{ height: 64, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.7))' }} />
          )}
          <div style={{ fontWeight: 600, fontSize: 16 }}>{cc.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, color: '#cfd4cf' }}>
            <CoinIcon size={14} />{cc.price}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#9aa39a', fontSize: 14, justifySelf: 'end', whiteSpace: 'nowrap' }}>
          <span onClick={() => flash('Coming soon ✨')} style={{ cursor: 'pointer' }}>🤍</span>
          <span onClick={openFairness} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>☑️ Fairness</span>
        </div>
      </div>

      {/* Reel viewport */}
      <div ref={vpRef} style={{ position: 'relative', height: 288, borderRadius: 16, overflow: 'hidden',
        background: 'radial-gradient(ellipse at center,#0e1410,#070907)', border: '1px solid rgba(255,255,255,.06)' }}>
        {/* Top/bottom markers */}
        <div style={{ position: 'absolute', left: '50%', top: 6, transform: 'translateX(-50%)', zIndex: 5,
          borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '12px solid #5fd75f' }} />
        <div style={{ position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)', zIndex: 5,
          borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: '12px solid #5fd75f' }} />
        {/* Fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(90deg,#070907,transparent)', zIndex: 4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(270deg,#070907,transparent)', zIndex: 4, pointerEvents: 'none' }} />
        {/* Reel strip */}
        <div ref={reelRef} style={{ display: 'flex', gap: 16, height: '100%', alignItems: 'center', padding: '0 24px', willChange: 'transform' }}>
          {displayReel.map((t, i) => (
            <div key={i} style={{ flex: '0 0 160px', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 150, height: 170, borderRadius: 14, background: `radial-gradient(circle at 50% 56%,${t.color}30,transparent 66%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${t.color}22` }}>
                <SkinImage marketName={t.marketName} imageUrl={t.imageUrl} size={90} glowColor={t.color} />
                <span style={{ fontSize: 10, fontWeight: 600, color: t.color }}>{t.skin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, margin: '18px 0 22px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {multBtns.map(n => (
            <div key={n} onClick={() => setMultiplier(n)} style={{ width: 46, height: 46, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              border: multiplier === n ? '1px solid rgba(95,213,95,.5)' : '1px solid rgba(255,255,255,.1)',
              background: multiplier === n ? 'rgba(95,213,95,.16)' : '#0e120e',
              color: multiplier === n ? '#7fe877' : '#cfd4cf' }}>{n}</div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {logged ? (
            <>
              <button onClick={() => doSpin(false)} disabled={phase === 'spin'} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15,
                color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none',
                padding: '14px 40px', borderRadius: 11, cursor: phase === 'spin' ? 'default' : 'pointer',
                boxShadow: '0 8px 20px rgba(95,213,95,.3)', opacity: phase === 'spin' ? .6 : 1 }}>Open Case</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#10140f', border: '1px solid rgba(255,255,255,.1)', padding: '13px 20px', borderRadius: 11, fontWeight: 600 }}>
                <CoinIcon size={16} />{cc.price}
              </div>
            </>
          ) : (
            <button onClick={openLogin} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15,
              color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none',
              padding: '14px 40px', borderRadius: 11, cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(95,213,95,.3)' }}>Login to Open</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logged && (
            <button onClick={() => doSpin(true)} title="Fast spin" style={{ width: 48, height: 46, borderRadius: 11,
              background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', color: '#cfd4cf', cursor: 'pointer', fontSize: 15 }}>⏩</button>
          )}
          <button onClick={() => doSpin(false, true)} style={{ display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-outfit)', fontWeight: 500, fontSize: 14, color: '#cfd4cf',
            background: '#0e120e', border: '1px solid rgba(255,255,255,.1)', padding: '12px 18px', borderRadius: 11, cursor: 'pointer' }}>↻ Demo spin</button>
        </div>
      </div>

      {/* Free case banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        border: '1px solid rgba(95,213,95,.3)', borderRadius: 14, padding: '18px 24px', marginBottom: 34,
        background: 'linear-gradient(120deg,#0c150b,#0e1d0d)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 34 }}>🎁</span>
          <div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 18 }}>Get 1 <span style={{ color: '#5fd75f' }}>FREE</span> Case!</div>
            <div style={{ fontSize: 13, color: '#9aa39a' }}>Open 10 Cases in 1 Collection and u get 1 Free Case!</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <span style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '8px 16px' }}>0</span>
            <span style={{ color: '#6b746b' }}>/</span>
            <span style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '8px 16px' }}>10</span>
          </div>
          <button onClick={() => flash('Coming soon ✨')} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 24px', borderRadius: 11, cursor: 'pointer' }}>Get Free Case</button>
        </div>
      </div>

      {/* Best Drops */}
      <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>🔥 Best Drops</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 34 }}>
        {bestDrops.map((d) => (
          <div key={d.key} style={{ position: 'relative', background: '#0b0e0a', border: '1px solid rgba(255,255,255,.06)',
            borderBottom: `2px solid ${d.color}`, borderRadius: 14, padding: '14px 12px 12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 34,
              background: `radial-gradient(ellipse at center,${d.color},transparent 70%)`, opacity: .5 }} />
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a', position: 'relative' }}>{d.pct}%</div>
            <SkinImage marketName={d.marketName} imageUrl={d.imageUrl} size={90} glowColor={d.color} style={{ margin: '4px auto' }} />
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a' }}>{d.w}</div>
            <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 13, color: d.color }}>{d.skin}</div>
            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 5, fontSize: 13, color: '#cfd4cf' }}>
              <CoinIcon size={13} />{d.price}
            </div>
          </div>
        ))}
      </div>

      {/* Items Contains */}
      <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>🧰 Items Contains</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
        {itemsContains.map((d) => (
          <div key={d.key} style={{ position: 'relative', background: '#0b0e0a', border: '1px solid rgba(255,255,255,.06)',
            borderBottom: `2px solid ${d.color}`, borderRadius: 14, padding: '14px 12px 12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 34,
              background: `radial-gradient(ellipse at center,${d.color},transparent 70%)`, opacity: .45 }} />
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a', position: 'relative' }}>{d.pct}%</div>
            <SkinImage marketName={d.marketName} imageUrl={d.imageUrl} size={90} glowColor={d.color} style={{ margin: '4px auto' }} />
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a' }}>{d.w}</div>
            <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 13, color: d.color }}>{d.skin}</div>
            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 5, fontSize: 13, color: '#cfd4cf' }}>
              <CoinIcon size={13} />{d.price}
            </div>
          </div>
        ))}
      </div>

      {/* Reveal overlay */}
      {phase === 'done' && won && (
        <div className="anim-pop" style={{ position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(4,6,4,.9)', backdropFilter: 'blur(7px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: 'min(560px,95vw)', background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 20, padding: 28, boxShadow: '0 40px 100px rgba(0,0,0,.7)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 16 }}>{cc.name}</div>
                <div style={{ fontSize: 12, color: '#9aa39a' }}>Item added to your inventory</div>
              </div>
              <button onClick={handleClose} style={{ width: 38, height: 38, borderRadius: 10, background: '#11140f', border: '1px solid rgba(255,255,255,.1)', color: '#cfd4cf', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 4px' }}>
              <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 20, marginBottom: 18, color: won.color }}>You unboxed!</div>
              <div style={{ width: 260, borderRadius: 16, background: '#0c100c', border: `1px solid ${won.color}`,
                boxShadow: `0 0 50px -6px ${won.color}`, padding: 18, textAlign: 'center' }}>
                <SkinImage marketName={won.marketName} imageUrl={won.imageUrl} size={160} glowColor={won.color} style={{ margin: '0 auto 14px' }} />
                <div style={{ fontSize: 13, color: '#9aa39a' }}>{won.w}</div>
                <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 18, color: won.color, margin: '2px 0 4px' }}>{won.skin}</div>
                <div style={{ fontSize: 12, color: '#8a928a', marginBottom: 10 }}>Factory New</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 16, marginBottom: 10 }}>
                  <CoinIcon size={16} />{won.price}
                </div>
                {'hash' in won && (
                  <div onClick={openFairness} title="Click to verify" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#4a7a4a', wordBreak: 'break-all', cursor: 'pointer', padding: '6px 8px', background: '#0a0f0a', borderRadius: 7, border: '1px solid rgba(95,213,95,.12)' }}>
                    {(won as any).hash?.slice(0, 32)}…
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                <button onClick={() => { closeOpen(); if (won) sellItem('__instant__'); flash(`Sold for ${won.price} coins`); }}
                  style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 14, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 24px', borderRadius: 11, cursor: 'pointer' }}>
                  Sell for {won.price}
                </button>
                <button onClick={handleOpenAgain} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14, color: '#cfd4cf', background: '#10140f', border: '1px solid rgba(255,255,255,.12)', padding: '12px 24px', borderRadius: 11, cursor: 'pointer' }}>Open Again</button>
                <button onClick={() => { if (won) keepItem(won, cc.name); closeOpen(); }}
                  style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14, color: '#7fe877', background: 'rgba(95,213,95,.1)', border: '1px solid rgba(95,213,95,.3)', padding: '12px 24px', borderRadius: 11, cursor: 'pointer' }}>
                  Keep
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
