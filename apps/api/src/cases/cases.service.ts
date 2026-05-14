import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { WalletService } from '../wallet/wallet.service'
import { ProvablyFairService } from '../provably-fair/provably-fair.service'
import { TransactionType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
    private provablyFair: ProvablyFairService,
  ) {}

  async findAll(activeOnly = true) {
    return this.prisma.case.findMany({
      where: activeOnly ? { active: true } : undefined,
      include: { items: { include: { skin: true } } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })
  }

  async findOne(id: string) {
    const c = await this.prisma.case.findUnique({
      where: { id },
      include: { items: { include: { skin: true } } },
    })
    if (!c) throw new NotFoundException('Case not found')
    return c
  }

  async openCase(userId: string, caseId: string) {
    const gameCase = await this.findOne(caseId)
    if (!gameCase.active) throw new BadRequestException('Case is not available')

    const openId = uuidv4()

    // Debit case price from wallet (atomic, with lock)
    await this.wallet.debit({
      userId,
      amount: gameCase.price,
      type: TransactionType.CASE_OPEN,
      referenceId: openId,
      metadata: { caseId },
    })

    // Roll provably fair result
    const seed = await this.provablyFair.getOrCreateActiveSeed(userId)
    const nonce = await this.provablyFair.incrementNonce(seed.id)
    const roll = this.provablyFair.generateRoll(seed.serverSeed, seed.clientSeed, nonce)

    // Select winning item based on weighted probabilities
    const wonItem = this.selectItemByRoll(roll, gameCase.items)
    if (!wonItem) throw new BadRequestException('Could not determine winning item')

    // Credit won skin value to user inventory
    await this.prisma.caseOpening.create({
      data: {
        id: openId,
        userId,
        caseId,
        skinId: wonItem.skinId,
        serverSeedHash: seed.serverSeedHash,
        clientSeed: seed.clientSeed,
        nonce,
        roll,
      },
    })

    // Add skin to user inventory
    await this.prisma.inventoryItem.create({
      data: {
        skinId: wonItem.skinId,
        userId,
        state: 'AVAILABLE',
        sourceProvider: 'INTERNAL',
      },
    })

    // Credit skin value to balance
    await this.wallet.credit({
      userId,
      amount: wonItem.skin.finalPrice,
      type: TransactionType.CASE_WIN,
      referenceId: openId,
      metadata: { caseId, skinId: wonItem.skinId },
    })

    return {
      openId,
      skin: wonItem.skin,
      roll,
      serverSeedHash: seed.serverSeedHash,
      clientSeed: seed.clientSeed,
      nonce,
    }
  }

  private selectItemByRoll(roll: number, items: any[]): any {
    const totalWeight = items.reduce((sum, item) => sum + item.probabilityWeight, 0)
    const target = roll * totalWeight

    let cumulative = 0
    for (const item of items) {
      cumulative += item.probabilityWeight
      if (target <= cumulative) return item
    }

    return items[items.length - 1]
  }

  async getOpeningHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [openings, total] = await Promise.all([
      this.prisma.caseOpening.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { skin: true, case: { select: { name: true, image: true } } },
      }),
      this.prisma.caseOpening.count({ where: { userId } }),
    ])
    return { openings, total, page, limit }
  }

  async getGlobalFeed(limit = 20) {
    return this.prisma.caseOpening.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        skin: true,
        case: { select: { name: true, image: true } },
        user: { select: { username: true, avatar: true } },
      },
    })
  }
}
