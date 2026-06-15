'use client';
import { useState, useEffect } from 'react';

interface Props {
  marketName: string;
  imageUrl?: string;   // pass directly to skip API fetch
  alt?: string;
  size?: number;
  style?: React.CSSProperties;
  glowColor?: string;
}

// In-memory cache for admin-searched skins (not in POOL)
const imgCache: Record<string, string> = {};

export function SkinImage({ marketName, imageUrl: staticUrl, alt, size = 100, style, glowColor }: Props) {
  const [src, setSrc] = useState<string | null>(staticUrl ?? imgCache[marketName] ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // If a static URL was passed, use it immediately — no API call
    if (staticUrl) { setSrc(staticUrl); return; }
    if (imgCache[marketName]) { setSrc(imgCache[marketName]); return; }
    fetch(`/api/skin-image?name=${encodeURIComponent(marketName)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.imageUrl) { imgCache[marketName] = d.imageUrl; setSrc(d.imageUrl); }
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [marketName, staticUrl]);

  const boxStyle: React.CSSProperties = {
    width: size, height: size,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    ...style,
  };

  if (!src || failed) {
    return (
      <div style={{ ...boxStyle, borderRadius: 10,
        backgroundImage: 'repeating-linear-gradient(135deg,rgba(255,255,255,.04) 0 6px,transparent 6px 12px)',
        border: '1px solid rgba(255,255,255,.06)' }}>
        {!failed && <span style={{ fontSize: 9, color: '#4a7a4a', fontFamily: 'var(--font-mono)' }}>…</span>}
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <img
        src={src}
        alt={alt || marketName}
        style={{
          maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
          filter: glowColor
            ? `drop-shadow(0 0 12px ${glowColor}88) drop-shadow(0 4px 8px rgba(0,0,0,.6))`
            : 'drop-shadow(0 4px 8px rgba(0,0,0,.6))',
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
