export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'CASE_OPEN'
  | 'CASE_WIN'
  | 'MARKETPLACE_PURCHASE'
  | 'MARKETPLACE_SALE'
  | 'AFFILIATE_COMMISSION'
  | 'BONUS'
  | 'REFUND'
  | 'ADMIN_ADJUSTMENT'

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId: string | null
  metadata: Record<string, unknown>
  createdAt: string
}
