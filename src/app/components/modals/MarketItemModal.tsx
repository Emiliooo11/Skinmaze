'use client';
import { useStore } from '@/app/store/useStore';
import { RAR, EXT_SHORT } from '@/app/lib/data';
import { CoinIcon } from '../CoinIcon';
import { Placeholder } from '../Placeholder';

export function MarketItemModal() {
  const { mpItem, closeMpItem, flash } = useStore();
  if (!mpItem) return null;

  const mi = mpItem;
  const rarity = RAR[mi.rar]?.n || 'Extraordinary type';
  const extShort = EXT_SHORT[mi.exterior] || 'FT';

  // 6 "another offers" based on the same item with slight price variations
  const offers = Array.from({ length: 6 }, (_, i) => ({
    id: i, w: mi.w, skin: mi.skin, color: mi.color, price: mi.price,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,6,4,.86)',
      backdropFilter: 'blur(7px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '80px 24px 40px', overflowY: 'auto' }}>
      <div className="anim-pop" style={{ width: 'min(1000px,95vw)', background: '#0d1014',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: 24,
        boxShadow: '0 40px 100px rgba(0,0,0,.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 17 }}>
            {mi.w} | <span style={{ color: mi.color }}>{mi.skin}</span> <span style={{ fontSize: 11, color: '#8a928a' }}>{extShort}</span>
          </div>
          <button onClick={closeMpItem} style={{ width: 34, height: 34, borderRadius: 9, background: '#1a1f26',
            border: '1px solid rgba(255,255,255,.1)', color: '#cfd4cf', fontSize: 17, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden',
            background: `radial-gradient(ellipse at center,${mi.color}22,#0a0d10 72%)`,
            border: '1px solid rgba(255,255,255,.05)', minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', width: 120, height: 4, borderRadius: 3, background: mi.color }} />
            <Placeholder label="item render" height={230} style={{ width: 300 }} />
          </div>
          <div style={{ background: '#13171d', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: 6, borderRadius: 4, marginBottom: 16,
              background: 'linear-gradient(90deg,#3ad44e,#9bd24a 30%,#e0c23a 55%,#e08a3a 75%,#e34a4a)' }}>
              <div style={{ position: 'absolute', left: '18%', top: -2, width: 3, height: 10, borderRadius: 2, background: '#fff' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span style={{ color: '#9aa39a', fontSize: 14 }}>Float</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>0.14223432</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span style={{ color: '#9aa39a', fontSize: 14 }}>Rarity</span>
              <span style={{ fontWeight: 600, fontSize: 14, color: mi.color }}>{rarity}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0' }}>
              <span style={{ color: '#9aa39a', fontSize: 14 }}>Pattern</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>32</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0a0d12',
              border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: 13, margin: '14px 0 12px', fontWeight: 600 }}>
              <CoinIcon size={16} />{mi.price}
            </div>
            <button onClick={() => { flash('Added to cart 🛒'); closeMpItem(); }} style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: 14, borderRadius: 11, cursor: 'pointer' }}>Add to Cart</button>
          </div>
        </div>

        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Another Offers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
          {offers.map(o => (
            <div key={o.id} onClick={closeMpItem} style={{ position: 'relative', background: '#0b0e0a',
              border: `1px solid ${o.color}`, borderRadius: 12, padding: '12px 10px', cursor: 'pointer', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: o.color }} />
              <Placeholder label="skin" height={84} style={{ margin: '6px 0 9px' }} />
              <div style={{ textAlign: 'center', fontSize: 10, color: '#9aa39a' }}>{o.w}</div>
              <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: o.color }}>{o.skin}</div>
              <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 5, fontSize: 12, color: '#cfd4cf' }}>
                <CoinIcon size={12} />{o.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
