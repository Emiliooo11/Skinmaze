import type { Skin } from './skin'
import type { PublicUser } from './user'

export type ListingStatus = 'ACTIVE' | 'SOLD' | 'CANCELLED'

export interface MarketListing {
  id: string
  sellerId: string
  seller: PublicUser
  skinId: string
  skin: Skin
  price: number
  status: ListingStatus
  createdAt: string
  soldAt: string | null
}
