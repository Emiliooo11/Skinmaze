import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { WalletService } from '../wallet/wallet.service'
import { InventoryService } from '../inventory/inventory.service'
import { TransactionType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const SELL_FEE = 0.05 // 5%

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
    private inventory: InventoryService,
  ) {}

  async getListings(params: {
    page?: number
    limit?: number
    search?: string
    minPrice?: number
    maxPrice?: number
    rarity?: string
    wear?: string
    sortBy?: string
  }) {
    const { page = 1, limit = 24, search, minPrice, maxPrice, rarity, wear } = params
    const skip = (page - 1) * limit

    const where: any = { status: 'ACTIVE' }
    if (rarity) where.skin = { rarity }
    if (wear) where.skin = { ...where.skin, wear }
    if (minPrice || maxPrice) where.price = {}
    if (minPrice) where.price.gte = minPrice
    if (maxPrice) where.price.lte = maxPrice
    if (search) where.skin = { ...where.skin, marketHashName: { contains: search, mode: 'insensitive' } }

    const [listings, total] = await Promise.all([
      this.prisma.marketListing.findMany({
        where,
        skip,
        take: limit,
        include: { skin: true, seller: { select: { username: true, avatar: true } } },
        orderBy: { price: 'asc' },
      }),
      this.prisma.marketListing.count({ where }),
    ])

    return { listings, total, page, limit }
  }

  async listItem(userId: string, itemId: string, price: number) {
    if (price <= 0) throw new BadRequestException('Price must be positive')

    await this.inventory.reserveItem(itemId, userId)

    const listing = await this.prisma.marketListing.create({
      data: {
        id: uuidv4(),
        sellerId: userId,
        inventoryItemId: itemId,
        skinId: (await this.prisma.inventoryItem.findUnique({ where: { id: itemId } }))!.skinId,
        price,
        status: 'ACTIVE',
      },
      include: { skin: true },
    })

    return listing
  }

  async buyItem(buyerId: string, listingId: string) {
    const listing = await this.prisma.marketListing.findUnique({
      where: { id: listingId },
      include: { skin: true },
    })

    if (!listing || listing.status !== 'ACTIVE') {
      throw new NotFoundException('Listing not available')
    }

    if (listing.sellerId === buyerId) {
      throw new BadRequestException('Cannot buy your own listing')
    }

    const saleId = uuidv4()
    const sellerReceives = listing.price * (1 - SELL_FEE)

    // Debit buyer
    await this.wallet.debit({
      userId: buyerId,
      amount: listing.price,
      type: TransactionType.MARKETPLACE_PURCHASE,
      referenceId: saleId,
      metadata: { listingId, skinId: listing.skinId },
    })

    // Credit seller (minus fee)
    await this.wallet.credit({
      userId: listing.sellerId,
      amount: sellerReceives,
      type: TransactionType.MARKETPLACE_SALE,
      referenceId: saleId,
      metadata: { listingId, fee: listing.price * SELL_FEE },
    })

    // Transfer inventory item to buyer
    await this.prisma.$transaction([
      this.prisma.marketListing.update({
        where: { id: listingId },
        data: { status: 'SOLD', soldAt: new Date() },
      }),
      this.prisma.inventoryItem.update({
        where: { id: listing.inventoryItemId },
        data: { userId: buyerId, state: 'AVAILABLE' },
      }),
    ])

    return { success: true, skin: listing.skin }
  }

  async cancelListing(userId: string, listingId: string) {
    const listing = await this.prisma.marketListing.findFirst({
      where: { id: listingId, sellerId: userId, status: 'ACTIVE' },
    })

    if (!listing) throw new NotFoundException('Listing not found')

    await this.prisma.marketListing.update({
      where: { id: listingId },
      data: { status: 'CANCELLED' },
    })

    await this.inventory.releaseReservation(listing.inventoryItemId)

    return { success: true }
  }
}
