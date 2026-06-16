'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useStore } from '@/app/store/useStore';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RecentOpen {
  id: string;
  won_item: string;
  won_item_image: string | null;
  won_item_color: string | null;
  won_value: number;
  player_name: string | null;
  player_avatar: string | null;
  case_name: string | null;
}

// Rarity color from won_item_color or fallback gradient
function rarityColor(color: string | null) {
  const map: Record<string, string> = {
    red: '#eb4b4b', pink: '#d32ee6', purple: '#8847ff',
    blue: '#4b69ff', lightblue: '#5e98d9', white: '#b0c3d9', gold: '#e4ae39',
  };
  return color ? (map[color] ?? color) : '#4b69ff';
}

export function Ticker() {
  const { go } = useStore();
  const [items, setItems] = useState<RecentOpen[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);

  useEffect(() => {
    // Initial fetch
    fetch('/api/recent-opens')
      .then(r => r.json())
      .then((data: RecentOpen[]) => setItems(data));

    // Realtime subscription
    const channel = supabase
      .channel('wagers-ticker')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wagers' }, (payload) => {
        const row = payload.new as RecentOpen;
        if (row.won_item) {
          setItems(prev => [row, ...prev].slice(0, 60));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const totalWidth = track.scrollWidth / 2;

    function step() {
      posRef.current += 0.5;
      if (posRef.current >= totalWidth) posRef.current = 0;
      if (track) track.style.transform = `translateX(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [items.length]);

  // Pause on hover
  function pauseScroll() { if (animRef.current) cancelAnimationFrame(animRef.current); animRef.current = null; }
  function resumeScroll() {
    if (animRef.current) return;
    const track = trackRef.current;
    const totalWidth = track ? track.scrollWidth / 2 : 9999;
    function step() {
      posRef.current += 0.5;
      if (posRef.current >= totalWidth) posRef.current = 0;
      if (track) track.style.transform = `translateX(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
  }

  const displayItems = items.length > 0 ? items : Array.from({ length: 20 }, (_, i) => ({
    id: String(i), won_item: 'AK-47 | Redline', won_item_image: null,
    won_item_color: ['blue','purple','pink','red'][i % 4],
    won_value: 12.5, player_name: 'Player', player_avatar: null, case_name: 'Pandora Box',
  }));

  // Double the list for seamless loop
  const looped = [...displayItems, ...displayItems];

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, padding: '0 0 0 22px',
      marginBottom: 18, position: 'relative', zIndex: 10 }}>

      {/* Side buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingRight: 14, flexShrink: 0 }}>
        <div onClick={() => go('cases')} style={{ width: 44, height: 44, borderRadius: 10,
          background: '#10140f', border: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>🎒</div>
        <div style={{ width: 44, height: 44, borderRadius: 10,
          background: '#10140f', border: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#9aa39a' }}>🕘</div>
      </div>

      {/* Scrolling track */}
      <div style={{ overflow: 'hidden', flex: 1,
        WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent)' }}
        onMouseEnter={pauseScroll} onMouseLeave={resumeScroll}>
        <div ref={trackRef} style={{ display: 'flex', gap: 10, width: 'max-content' }}>
          {looped.map((item, i) => {
            const color = rarityColor(item.won_item_color);
            return (
              <div key={`${item.id}-${i}`}
                onClick={() => go('market')}
                style={{
                  flex: '0 0 92px', height: 96, borderRadius: 11, cursor: 'pointer',
                  background: '#0f130e', border: '1px solid rgba(255,255,255,.06)',
                  borderTop: `2px solid ${color}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'flex-end', padding: '6px 6px 8px',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: `0 0 18px ${color}22`,
                  transition: 'transform .15s',
                }}>
                {/* Item image or placeholder */}
                {item.won_item_image ? (
                  <img src={item.won_item_image} alt={item.won_item}
                    style={{ position: 'absolute', top: 4, left: 4, right: 4, bottom: 20,
                      objectFit: 'contain', width: 'calc(100% - 8px)', height: 'calc(100% - 28px)' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: '6px 6px 24px', borderRadius: 8,
                    backgroundImage: 'repeating-linear-gradient(135deg,rgba(140,120,200,.10) 0 7px,transparent 7px 14px)' }} />
                )}
                {/* Player avatar */}
                {item.player_avatar && (
                  <img src={item.player_avatar} alt=""
                    style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18,
                      borderRadius: '50%', border: `1px solid ${color}`, objectFit: 'cover' }} />
                )}
                {/* Item name */}
                <span style={{ fontSize: 9, fontWeight: 600, color, position: 'relative',
                  textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word',
                  maxWidth: '100%', overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.won_item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
