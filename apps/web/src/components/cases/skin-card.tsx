import Image from 'next/image'
import { getRarityColor, getRarityGlow, WEAR_LABELS, formatPrice } from '@/lib/utils'
import { RarityBadge } from '@/components/ui/rarity-badge'
import type { Skin } from '@skinmaze/shared'

interface SkinCardProps {
  skin: Skin
  odds?: number
  compact?: boolean
  highlight?: boolean
}

export function SkinCard({ skin, odds, compact, highlight }: SkinCardProps) {
  const color = getRarityColor(skin.rarity)
  const glow = highlight ? getRarityGlow(skin.rarity) : undefined

  if (compact) {
    return (
      <div
        className="relative flex flex-col items-center gap-1 p-2 rounded-lg bg-surface border border-border transition-all duration-200"
        style={{ borderColor: `${color}40`, boxShadow: glow }}
      >
        <div
          className="w-full h-0.5 rounded-full mb-1"
          style={{ backgroundColor: color }}
        />
        <div className="relative w-16 h-12">
          <Image
            src={skin.iconUrl}
            alt={skin.marketHashName}
            fill
            className="object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <p className="text-xs text-center text-white/80 leading-tight line-clamp-2">
          {skin.skinName}
        </p>
        <p className="text-xs font-semibold" style={{ color }}>
          {formatPrice(skin.finalPrice)}
        </p>
        {odds !== undefined && (
          <p className="text-xs text-muted">{odds.toFixed(2)}%</p>
        )}
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col rounded-xl bg-surface border overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{ borderColor: `${color}50`, boxShadow: glow }}
    >
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <div className="flex flex-col items-center gap-3 p-4">
        <div className="relative w-32 h-24">
          <Image
            src={skin.iconUrl}
            alt={skin.marketHashName}
            fill
            className="object-contain drop-shadow-lg"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <div className="text-center space-y-1 w-full">
          <p className="text-xs text-muted">{skin.weapon}</p>
          <p className="text-sm font-semibold text-white leading-tight">{skin.skinName}</p>
          <p className="text-xs text-muted">{WEAR_LABELS[skin.wear] ?? skin.wear}</p>
          <RarityBadge rarity={skin.rarity} className="mt-1" />
        </div>
        <div className="flex items-center justify-between w-full mt-1">
          <p className="text-base font-bold text-white">{formatPrice(skin.finalPrice)}</p>
          {odds !== undefined && (
            <p className="text-xs text-muted">{odds.toFixed(2)}%</p>
          )}
        </div>
      </div>
    </div>
  )
}
