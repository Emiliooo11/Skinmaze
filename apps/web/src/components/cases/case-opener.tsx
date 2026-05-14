'use client'

import { useRef, useState, useCallback } from 'react'
import { motion, animate } from 'framer-motion'
import Image from 'next/image'
import { getRarityColor, getRarityGlow, formatPrice } from '@/lib/utils'
import type { Case, CaseOpenResult, Skin } from '@skinmaze/shared'

const REEL_ITEM_WIDTH = 168 // px, includes gap
const REEL_VISIBLE_ITEMS = 7
const TOTAL_SPIN_ITEMS = 60
const WINNER_INDEX = 45 // landing position

interface CaseOpenerProps {
  caseData: Case
  onOpen: () => Promise<CaseOpenResult>
  isOpening: boolean
  disabled: boolean
}

export function CaseOpener({ caseData, onOpen, isOpening, disabled }: CaseOpenerProps) {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [result, setResult] = useState<CaseOpenResult | null>(null)
  const [reelItems, setReelItems] = useState<Skin[]>([])
  const reelRef = useRef<HTMLDivElement>(null)

  const buildReel = useCallback(
    (winner: Skin): Skin[] => {
      const pool = caseData.items.map((i) => i.skin)
      const items: Skin[] = []
      for (let i = 0; i < TOTAL_SPIN_ITEMS; i++) {
        if (i === WINNER_INDEX) {
          items.push(winner)
        } else {
          items.push(pool[Math.floor(Math.random() * pool.length)])
        }
      }
      return items
    },
    [caseData.items],
  )

  const handleOpen = useCallback(async () => {
    if (phase !== 'idle' || disabled) return

    setPhase('spinning')
    setResult(null)

    try {
      const openResult = await onOpen()
      const reel = buildReel(openResult.skin)
      setReelItems(reel)

      // Wait a tick for React to render the reel
      await new Promise((r) => setTimeout(r, 50))

      if (!reelRef.current) return

      // Calculate target offset so WINNER_INDEX is centred
      const centreOffset = Math.floor(REEL_VISIBLE_ITEMS / 2)
      const targetX = -((WINNER_INDEX - centreOffset) * REEL_ITEM_WIDTH)

      await animate(reelRef.current, { x: targetX }, {
        duration: 5,
        ease: [0.12, 0.8, 0.25, 1],
      })

      setResult(openResult)
      setPhase('result')
    } catch {
      setPhase('idle')
    }
  }, [phase, disabled, onOpen, buildReel])

  const handleReset = () => {
    setPhase('idle')
    setResult(null)
    setReelItems([])
    if (reelRef.current) {
      animate(reelRef.current, { x: 0 }, { duration: 0 })
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Reel window */}
      {(phase === 'spinning' || phase === 'result') && reelItems.length > 0 && (
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-surface-2">
          {/* Centre marker */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary z-10 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-40 bg-primary/5 z-10 pointer-events-none" />
          {/* Left/right fade */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface-2 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface-2 to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden" style={{ height: 160 }}>
            <motion.div
              ref={reelRef}
              className="flex gap-2 py-4 pl-4"
              initial={{ x: 0 }}
              style={{ width: TOTAL_SPIN_ITEMS * REEL_ITEM_WIDTH }}
            >
              {reelItems.map((skin, i) => (
                <ReelItem
                  key={i}
                  skin={skin}
                  isWinner={phase === 'result' && i === WINNER_INDEX}
                />
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Result card */}
      {phase === 'result' && result && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 p-6 rounded-xl border bg-surface w-full max-w-sm"
          style={{
            borderColor: `${getRarityColor(result.skin.rarity)}60`,
            boxShadow: getRarityGlow(result.skin.rarity),
          }}
        >
          <p className="text-sm text-muted">You won</p>
          <div className="relative w-40 h-28">
            <Image
              src={result.skin.iconUrl}
              alt={result.skin.marketHashName}
              fill
              className="object-contain drop-shadow-xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted">{result.skin.weapon}</p>
            <p className="text-lg font-bold text-white">{result.skin.skinName}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: getRarityColor(result.skin.rarity) }}>
              {formatPrice(result.skin.finalPrice)}
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={handleReset} className="btn-secondary flex-1">
              Open Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Open button */}
      {phase === 'idle' && (
        <button
          onClick={handleOpen}
          disabled={disabled || isOpening}
          className="btn-primary text-lg px-12 py-3 w-full max-w-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOpening ? 'Opening...' : `Open for ${formatPrice(caseData.price)}`}
        </button>
      )}
    </div>
  )
}

function ReelItem({ skin, isWinner }: { skin: Skin; isWinner: boolean }) {
  const color = getRarityColor(skin.rarity)
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg border transition-all duration-300"
      style={{
        width: REEL_ITEM_WIDTH - 8,
        borderColor: isWinner ? color : `${color}30`,
        backgroundColor: isWinner ? `${color}15` : '#16161a',
        boxShadow: isWinner ? getRarityGlow(skin.rarity) : undefined,
      }}
    >
      <div className="h-1 w-full rounded-t-lg" style={{ backgroundColor: color }} />
      <div className="flex flex-col items-center gap-1 p-2">
        <div className="relative w-20 h-14">
          <Image
            src={skin.iconUrl}
            alt={skin.skinName}
            fill
            className="object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <p className="text-xs text-white/70 text-center line-clamp-1">{skin.skinName}</p>
        <p className="text-xs font-semibold" style={{ color }}>
          {formatPrice(skin.finalPrice)}
        </p>
      </div>
    </div>
  )
}
