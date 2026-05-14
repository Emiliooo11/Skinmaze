export type SkinRarity = 'CONSUMER' | 'INDUSTRIAL' | 'MILSPEC' | 'RESTRICTED' | 'CLASSIFIED' | 'COVERT' | 'CONTRABAND'
export type WearCondition = 'FACTORY_NEW' | 'MINIMAL_WEAR' | 'FIELD_TESTED' | 'WELL_WORN' | 'BATTLE_SCARRED'

export interface Skin {
  id: string
  marketHashName: string
  weapon: string
  skinName: string
  rarity: SkinRarity
  wear: WearCondition
  floatValue: number | null
  stickers: SkinSticker[]
  phase: string | null
  paintSeed: number | null
  iconUrl: string
  inspectLink: string | null
  steamPrice: number
  finalPrice: number
  liquidityScore: number
}

export interface SkinSticker {
  name: string
  iconUrl: string
  slot: number
  wear?: number
}
