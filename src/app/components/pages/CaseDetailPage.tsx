'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/app/store/useStore';
import { randItem, ReelItem, buildCaseContents } from '@/app/lib/data';
import { usdToCoins, fmtCoins } from '@/app/lib/currency';
import { rollToItem } from '@/app/lib/provablyFair';
import { playSpinSound, playRevealSound } from '@/app/lib/audio';
import { CoinIcon } from '../CoinIcon';
import { SkinImage } from '../SkinImage';

const VITEM_H   = 140; // px per item in vertical reel
const VITEM_GAP = 12;
const VSTEP     = VITEM_H + VITEM_GAP;
const VREEL_LEN = 28;
const VWIN_IDX  = 22; // winning item lands at this index
const VVP_H     = 380; // viewport height

function buildReel(count: number): ReelItem[] {
  return Array.from({ length: count }, () => randItem());
}

function parseCoin(s: string): number {
  return parseFloat(s.replace(/,/g, '')) || 0;
}

export function CaseDetailPage() {
  const {
    currentCase, phase, won, reel, multiplier, setMultiplier, go, flash,
    startSpin, finishSpin, closeOpen, keepItem, sellItem, adjustBalance,
    serverSeed, clientSeed, nonce, recordSpin, setLastSpinHash,
    openFairness, user, logged, openLogin,
  } = useStore();

  // ── Single-case refs ──────────────────────────────────────────────────────
  const reelRef  = useRef<HTMLDivElement>(null);
  const vpRef    = useRef<HTMLDivElement>(null);
  const spinTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Multi-case local state ────────────────────────────────────────────────
  const [multiSpinning, setMultiSpinning] = useState(false);
  const [multiDone, setMultiDone]         = useState(false);
  const [multiWon, setMultiWon]           = useState<ReelItem[]>([]);
  const [multiReels, setMultiReels]       = useState<ReelItem[][]>([]);
  // 'keep' | 'sell' per item index — default all to 'sell'
  const [multiDecisions, setMultiDecisions] = useState<('keep' | 'sell')[]>([]);
  const vReelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const multiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDemoSpin = useRef(false);

  const cc = currentCase || { name: 'Case', price: fmtCoins(usdToCoins(1343.09)) };
  const casePrice = parseCoin(cc.price);
  const totalPrice = casePrice * multiplier;
  const isMulti = multiplier > 1;

  const spinning = isMulti ? multiSpinning : phase === 'spin';

  // ── Single-case spin ──────────────────────────────────────────────────────
  async function doSingleSpin(fast: boolean, demo = false) {
    if (phase === 'spin') return;
    if (!demo && !logged) { openLogin(); return; }
    isDemoSpin.current = demo;

    if (!demo) {
      const result = await adjustBalance(-casePrice);
      if ('error' in result && result.error === 'insufficient_balance') {
        flash('Insufficient balance — deposit more coins!');
        return;
      }
    }

    const newReel = buildReel(60);
    const winIdx  = 54;
    const dur     = fast ? 1.7 : 5.6;
    const spinNonce = nonce;

    rollToItem(serverSeed, clientSeed, spinNonce).then(wonItem => {
      newReel[winIdx] = wonItem;
      startSpin(newReel, wonItem);
      setLastSpinHash((wonItem as any).hash);
      recordSpin({ serverSeed, clientSeed, nonce: spinNonce, hash: (wonItem as any).hash, item: `${wonItem.w} | ${wonItem.skin}`, price: wonItem.price });
      useStore.setState(s => ({ nonce: s.nonce + 1 }));

      if (!demo) {
        const itemPrice  = parseCoin(wonItem.price);
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
      }

      if (startTimer.current) clearTimeout(startTimer.current);
      startTimer.current = setTimeout(() => {
        const vp     = vpRef.current;
        const reelEl = reelRef.current;
        if (vp && reelEl) {
          const step   = 176;
          const center = vp.offsetWidth / 2;
          const jitter = Math.random() * 90 - 45;
          const offset = winIdx * step + step / 2 - center + jitter;
          reelEl.style.transition = 'none';
          reelEl.style.transform  = 'translateX(0px)';
          void reelEl.offsetWidth;
          reelEl.style.transition = `transform ${dur}s cubic-bezier(0.08,0.82,0.14,1)`;
          reelEl.style.transform  = `translateX(${-offset}px)`;
        }
        playSpinSound(dur);
        if (spinTimer.current) clearTimeout(spinTimer.current);
        spinTimer.current = setTimeout(() => {
          if (isDemoSpin.current) { closeOpen(); } else { finishSpin(); playRevealSound(); }
        }, dur * 1000 + 150);
      }, 70);
    });
  }

  // ── Multi-case spin ───────────────────────────────────────────────────────
  async function doMultiSpin(demo = false) {
    if (multiSpinning) return;
    if (!demo && !logged) { openLogin(); return; }
    isDemoSpin.current = demo;

    if (!demo) {
      const result = await adjustBalance(-totalPrice);
      if ('error' in result && result.error === 'insufficient_balance') {
        flash('Insufficient balance — deposit more coins!');
        return;
      }
    }

    const spinNonce = nonce;
    const wonItems: ReelItem[] = await Promise.all(
      Array.from({ length: multiplier }, (_, i) =>
        rollToItem(serverSeed, clientSeed, spinNonce + i)
      )
    );
    useStore.setState(s => ({ nonce: s.nonce + multiplier }));
    wonItems.forEach((wi, i) => {
      recordSpin({ serverSeed, clientSeed, nonce: spinNonce + i, hash: (wi as any).hash, item: `${wi.w} | ${wi.skin}`, price: wi.price });
    });

    const reels: ReelItem[][] = wonItems.map(wonItem => {
      const r = buildReel(VREEL_LEN);
      r[VWIN_IDX] = wonItem;
      return r;
    });

    setMultiReels(reels);
    setMultiWon(wonItems);
    setMultiDecisions(wonItems.map(() => 'sell'));
    setMultiDone(false);

    // Reset all reel positions
    vReelRefs.current.forEach(el => {
      if (el) { el.style.transition = 'none'; el.style.transform = 'translateY(0px)'; }
    });

    await new Promise(r => setTimeout(r, 60));

    const dur    = 5.6;
    const center = VVP_H / 2;

    setMultiSpinning(true);

    playSpinSound(dur);

    // Stagger start slightly per reel for a cascading feel
    wonItems.forEach((_, idx) => {
      setTimeout(() => {
        const el = vReelRefs.current[idx];
        if (!el) return;
        const jitter = Math.random() * 30 - 15;
        const offset = VWIN_IDX * VSTEP + VITEM_H / 2 - center + jitter;
        el.style.transition = 'none';
        el.style.transform  = 'translateY(0px)';
        void el.offsetWidth;
        el.style.transition = `transform ${dur}s cubic-bezier(0.08,0.82,0.14,1)`;
        el.style.transform  = `translateY(${-offset}px)`;
      }, idx * 80);
    });

    if (multiTimer.current) clearTimeout(multiTimer.current);
    multiTimer.current = setTimeout(() => {
      setMultiSpinning(false);
      if (isDemoSpin.current) { handleMultiClose(); return; }
      setMultiDone(true);
      playRevealSound();

      if (!demo) {
        wonItems.forEach(wonItem => {
          const itemPrice = parseCoin(wonItem.price);
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
        });
      }
    }, dur * 1000 + multiplier * 80 + 200);
  }

  function doSpin(fast: boolean, demo = false) {
    if (isMulti) return doMultiSpin(demo);
    return doSingleSpin(fast, demo);
  }

  function handleClose() {
    if (spinTimer.current)  clearTimeout(spinTimer.current);
    if (startTimer.current) clearTimeout(startTimer.current);
    closeOpen();
    if (reelRef.current) { reelRef.current.style.transition = 'none'; reelRef.current.style.transform = ''; }
  }

  function handleMultiClose() {
    if (multiTimer.current) clearTimeout(multiTimer.current);
    setMultiDone(false);
    setMultiWon([]);
    setMultiReels([]);
    vReelRefs.current.forEach(el => {
      if (el) { el.style.transition = 'none'; el.style.transform = 'translateY(0px)'; }
    });
  }

  function handleOpenAgain() {
    handleClose();
    setTimeout(() => doSpin(false), 80);
  }

  function handleMultiOpenAgain() {
    handleMultiClose();
    setTimeout(() => doSpin(false), 80);
  }

  useEffect(() => {
    return () => {
      if (spinTimer.current)  clearTimeout(spinTimer.current);
      if (multiTimer.current) clearTimeout(multiTimer.current);
    };
  }, []);

  const displayReel   = reel.length > 0 ? reel : buildReel(24);
  const caseContents  = buildCaseContents();
  const multBtns      = [1, 2, 3, 4];

  const totalCoinsLabel = multiplier > 1
    ? `${fmtCoins(totalPrice)} (${multiplier}×)`
    : cc.price;

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

      {/* ── SINGLE REEL (multiplier === 1) ────────────────────────────────── */}
      {!isMulti && (
        <div ref={vpRef} style={{ position: 'relative', height: 288, borderRadius: 16, overflow: 'hidden',
          background: 'radial-gradient(ellipse at center,#0e1410,#070907)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ position: 'absolute', left: '50%', top: 6, transform: 'translateX(-50%)', zIndex: 5,
            borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '12px solid #5fd75f' }} />
          <div style={{ position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)', zIndex: 5,
            borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: '12px solid #5fd75f' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(90deg,#070907,transparent)', zIndex: 4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(270deg,#070907,transparent)', zIndex: 4, pointerEvents: 'none' }} />
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
      )}

      {/* ── MULTI REELS (multiplier > 1) ──────────────────────────────────── */}
      {isMulti && (
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden',
          background: 'radial-gradient(ellipse at center,#0e1410,#070907)', border: '1px solid rgba(255,255,255,.06)',
          display: 'flex', gap: 12, padding: '0 16px', height: VVP_H }}>

          {/* Top/bottom gradient fades */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 80, background: 'linear-gradient(180deg,#070907,transparent)', zIndex: 4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80, background: 'linear-gradient(0deg,#070907,transparent)', zIndex: 4, pointerEvents: 'none' }} />

          {/* Center marker lines */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-1px)', height: 2, background: 'rgba(95,213,95,.5)', zIndex: 5, pointerEvents: 'none' }} />

          {/* N vertical reels */}
          {Array.from({ length: multiplier }, (_, colIdx) => {
            const reelData = multiReels[colIdx] || buildReel(VREEL_LEN);
            return (
              <div key={colIdx} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div
                  ref={el => { vReelRefs.current[colIdx] = el; }}
                  style={{ display: 'flex', flexDirection: 'column', gap: VITEM_GAP, willChange: 'transform', paddingTop: 12 }}
                >
                  {reelData.map((t, i) => (
                    <div key={i} style={{
                      height: VITEM_H, flexShrink: 0, borderRadius: 12,
                      background: `radial-gradient(circle at 50% 50%,${t.color}28,transparent 70%)`,
                      border: `1px solid ${t.color}33`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      <SkinImage marketName={t.marketName} imageUrl={t.imageUrl} size={70} glowColor={t.color} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: t.color, textAlign: 'center', padding: '0 4px', lineHeight: 1.2 }}>{t.skin}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, margin: '18px 0 22px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {multBtns.map(n => (
            <div key={n} onClick={() => { setMultiplier(n); handleMultiClose(); }} style={{ width: 46, height: 46, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              border: multiplier === n ? '1px solid rgba(95,213,95,.5)' : '1px solid rgba(255,255,255,.1)',
              background: multiplier === n ? 'rgba(95,213,95,.16)' : '#0e120e',
              color: multiplier === n ? '#7fe877' : '#cfd4cf' }}>{n}</div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {logged ? (
            <>
              <button onClick={() => doSpin(false)} disabled={spinning} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15,
                color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none',
                padding: '14px 40px', borderRadius: 11, cursor: spinning ? 'default' : 'pointer',
                boxShadow: '0 8px 20px rgba(95,213,95,.3)', opacity: spinning ? .6 : 1 }}>
                {isMulti ? `Open ${multiplier} Cases` : 'Open Case'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#10140f', border: '1px solid rgba(255,255,255,.1)', padding: '13px 18px', borderRadius: 11, fontWeight: 600, fontSize: 14 }}>
                <CoinIcon size={16} />{totalCoinsLabel}
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
          {logged && !isMulti && (
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

      {/* Case Contains — sorted rarest first */}
      <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>🧰 Case Contains</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
        {caseContents.map((d, i) => (
          <div key={i} style={{ position: 'relative', background: '#0b0e0a', border: '1px solid rgba(255,255,255,.06)',
            borderBottom: `2px solid ${d.color}`, borderRadius: 14, padding: '14px 12px 12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 34,
              background: `radial-gradient(ellipse at center,${d.color},transparent 70%)`, opacity: .45 }} />
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a', position: 'relative' }}>{d.chancePct}%</div>
            <SkinImage marketName={d.marketName} imageUrl={d.imageUrl} size={90} glowColor={d.color} style={{ margin: '4px auto' }} />
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a' }}>{d.w}</div>
            <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 13, color: d.color }}>{d.skin}</div>
            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 5, fontSize: 13 }}>
              <CoinIcon size={13} />{d.price}
            </div>
          </div>
        ))}
      </div>

      {/* ── Single result overlay ─────────────────────────────────────────── */}
      {!isMulti && phase === 'done' && won && (
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
                <button onClick={() => { closeOpen(); if (won) { const v = parseCoin(won.price); sellItem('__instant__', v); } }}
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

      {/* ── Multi result overlay ──────────────────────────────────────────── */}
      {isMulti && multiDone && multiWon.length > 0 && (() => {
        const sellVal  = multiWon.reduce((s, item, i) => multiDecisions[i] === 'sell' ? s + parseCoin(item.price) : s, 0);
        const keepCount = multiDecisions.filter(d => d === 'keep').length;
        const sellCount = multiDecisions.filter(d => d === 'sell').length;

        function toggleDecision(i: number) {
          setMultiDecisions(prev => prev.map((d, idx) => idx === i ? (d === 'sell' ? 'keep' : 'sell') : d));
        }

        function confirmDecisions() {
          multiWon.forEach((item, i) => {
            if (multiDecisions[i] === 'keep') keepItem(item, cc.name);
          });
          if (sellVal > 0) sellItem('__multi__', sellVal);
          handleMultiClose();
        }

        return (
          <div className="anim-pop" style={{ position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(4,6,4,.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
            <div style={{ width: 'min(920px,98vw)', background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 22, padding: '28px 28px 24px', boxShadow: '0 40px 100px rgba(0,0,0,.8)' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 18 }}>You unboxed {multiplier} items!</div>
                  <div style={{ fontSize: 12, color: '#6b746b', marginTop: 3 }}>Click each item to toggle Keep / Sell</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Quick-select shortcuts */}
                  <button onClick={() => setMultiDecisions(multiWon.map(() => 'keep'))}
                    style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 600, color: '#7fe877',
                      background: 'rgba(95,213,95,.08)', border: '1px solid rgba(95,213,95,.25)',
                      padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>Keep All</button>
                  <button onClick={() => setMultiDecisions(multiWon.map(() => 'sell'))}
                    style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 600, color: '#74e36b',
                      background: 'rgba(70,192,65,.08)', border: '1px solid rgba(70,192,65,.25)',
                      padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>Sell All</button>
                  <button onClick={handleMultiClose}
                    style={{ width: 38, height: 38, borderRadius: 10, background: '#11140f', border: '1px solid rgba(255,255,255,.1)', color: '#cfd4cf', fontSize: 18, cursor: 'pointer' }}>✕</button>
                </div>
              </div>

              {/* Item cards — clickable to toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${multiplier}, 1fr)`, gap: 14, margin: '20px 0 20px' }}>
                {multiWon.map((item, i) => {
                  const decision = multiDecisions[i] ?? 'sell';
                  const isKeep = decision === 'keep';
                  return (
                    <div key={i} onClick={() => toggleDecision(i)} style={{
                      borderRadius: 14, background: '#0c100c',
                      border: isKeep ? `2px solid ${item.color}` : '2px solid rgba(255,255,255,.1)',
                      boxShadow: isKeep ? `0 0 28px -6px ${item.color}` : 'none',
                      padding: '14px 12px 12px', textAlign: 'center', cursor: 'pointer',
                      transition: 'border-color .15s, box-shadow .15s',
                      opacity: !isKeep ? 0.75 : 1,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {/* Decision badge */}
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        background: isKeep ? item.color : 'rgba(70,192,65,.85)',
                        color: '#06270a',
                      }}>{isKeep ? 'KEEP' : 'SELL'}</div>

                      <SkinImage marketName={item.marketName} imageUrl={item.imageUrl} size={90} glowColor={item.color} style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: 11, color: '#9aa39a' }}>{item.w}</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: item.color, margin: '2px 0' }}>{item.skin}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6, fontWeight: 600, fontSize: 13 }}>
                        <CoinIcon size={12} />{item.price}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary bar */}
              <div style={{ background: '#0e120e', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12,
                padding: '14px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 24 }}>
                  <span style={{ fontSize: 13, color: '#9aa39a' }}>
                    Keeping <strong style={{ color: '#7fe877' }}>{keepCount}</strong> item{keepCount !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 13, color: '#9aa39a' }}>
                    Selling <strong style={{ color: '#74e36b' }}>{sellCount}</strong> item{sellCount !== 1 ? 's' : ''}
                    {sellVal > 0 && <> for <strong style={{ color: '#cfd4cf' }}> {fmtCoins(sellVal)} coins</strong></>}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={confirmDecisions}
                  style={{ flex: 1, fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15, color: '#06270a',
                    background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none',
                    padding: '14px 20px', borderRadius: 11, cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(95,213,95,.3)' }}>
                  Confirm
                  {sellCount > 0 && keepCount > 0 && ` — Sell ${sellCount}, Keep ${keepCount}`}
                  {sellCount > 0 && keepCount === 0 && ` — Sell All (${fmtCoins(sellVal)} coins)`}
                  {keepCount > 0 && sellCount === 0 && ` — Keep All`}
                </button>
                <button onClick={handleMultiOpenAgain}
                  style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 14, color: '#cfd4cf',
                    background: '#10140f', border: '1px solid rgba(255,255,255,.12)', padding: '14px 22px', borderRadius: 11, cursor: 'pointer' }}>
                  Open Again
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
