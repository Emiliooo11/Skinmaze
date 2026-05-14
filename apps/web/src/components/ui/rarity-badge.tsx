import { getRarityColor, RARITY_LABELS } from '@/lib/utils'

interface RarityBadgeProps {
  rarity: string
  className?: string
}

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
  const color = getRarityColor(rarity)
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className ?? ''}`}
      style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
    >
      {RARITY_LABELS[rarity] ?? rarity}
    </span>
  )
}
