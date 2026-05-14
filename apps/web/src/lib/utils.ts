import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SkinRarity } from '@skinmaze/shared'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const RARITY_COLORS: Record<string, string> = {
  CONSUMER: '#b0c3d9',
  INDUSTRIAL: '#5e98d9',
  MILSPEC: '#4b69ff',
  RESTRICTED: '#8847ff',
  CLASSIFIED: '#d32ce6',
  COVERT: '#eb4b4b',
  CONTRABAND: '#e4ae39',
}

export const RARITY_LABELS: Record<string, string> = {
  CONSUMER: 'Consumer Grade',
  INDUSTRIAL: 'Industrial Grade',
  MILSPEC: 'Mil-Spec',
  RESTRICTED: 'Restricted',
  CLASSIFIED: 'Classified',
  COVERT: 'Covert',
  CONTRABAND: 'Contraband',
}

export function getRarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] ?? '#b0c3d9'
}

export function getRarityGlow(rarity: string): string {
  const color = getRarityColor(rarity)
  return `0 0 20px ${color}40, 0 0 40px ${color}20`
}

export const WEAR_LABELS: Record<string, string> = {
  FACTORY_NEW: 'Factory New',
  MINIMAL_WEAR: 'Minimal Wear',
  FIELD_TESTED: 'Field-Tested',
  WELL_WORN: 'Well-Worn',
  BATTLE_SCARRED: 'Battle-Scarred',
}
