import type { Skin } from './skin'

export interface CaseItem {
  skinId: string
  skin: Skin
  probabilityWeight: number
  displayedOdds: number
  rarityTier: string
}

export interface Case {
  id: string
  name: string
  image: string
  price: number
  houseEdge: number
  active: boolean
  featured: boolean
  items: CaseItem[]
  createdAt: string
}

export interface CaseOpenResult {
  openId: string
  skin: Skin
  roll: number
  serverSeedHash: string
  clientSeed: string
  nonce: number
}
