import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { WalletService } from '../wallet/wallet.service'
import { TransactionType } from '@prisma/client'

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalOpenings, activeListings] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.caseOpening.count(),
      this.prisma.marketListing.count({ where: { status: 'ACTIVE' } }),
    ])

    const revenueResult = await this.prisma.transaction.aggregate({
      where: { type: TransactionType.CASE_OPEN },
      _sum: { amount: true },
    })

    return {
      totalUsers,
      totalOpenings,
      activeListings,
      totalRevenue: Math.abs(revenueResult._sum.amount ?? 0),
    }
  }

  async createCase(data: {
    name: string
    image: string
    price: number
    houseEdge: number
    items: { skinId: string; probabilityWeight: number; rarityTier: string }[]
  }) {
    return this.prisma.case.create({
      data: {
        name: data.name,
        image: data.image,
        price: data.price,
        houseEdge: data.houseEdge,
        active: false,
        featured: false,
        items: { create: data.items },
      },
      include: { items: { include: { skin: true } } },
    })
  }

  async createSkin(data: {
    marketHashName: string
    weapon: string
    skinName: string
    rarity: string
    wear: string
    floatValue?: number
    iconUrl: string
    steamPrice: number
    finalPrice: number
  }) {
    return this.prisma.skin.create({ data })
  }

  async adminAdjustBalance(userId: string, amount: number, reason: string) {
    if (amount > 0) {
      await this.wallet.credit({
        userId,
        amount,
        type: TransactionType.ADMIN_ADJUSTMENT,
        metadata: { reason },
      })
    } else {
      await this.wallet.debit({
        userId,
        amount: Math.abs(amount),
        type: TransactionType.ADMIN_ADJUSTMENT,
        metadata: { reason },
      })
    }
    return { success: true }
  }
}
