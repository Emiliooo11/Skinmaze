import type { Skin } from './skin'

export type InventoryState = 'AVAILABLE' | 'RESERVED' | 'LOCKED' | 'PENDING_TRADE' | 'DELIVERED' | 'FAILED'
export type InventorySource = 'INTERNAL' | 'WAXPEER' | 'CSFLOAT' | 'SKINPORT'

export interface InventoryItem {
  id: string
  skinId: string
  skin: Skin
  userId: string
  state: InventoryState
  sourceProvider: InventorySource
  reservedAt: string | null
  createdAt: string
}
