export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'

export interface User {
  id: string
  steamId: string
  username: string
  avatar: string
  profileUrl: string
  balance: number
  xp: number
  level: number
  role: UserRole
  banned: boolean
  affiliateCode: string | null
  totalWagered: number
  totalDeposited: number
  createdAt: string
}

export interface PublicUser {
  id: string
  username: string
  avatar: string
  level: number
}
