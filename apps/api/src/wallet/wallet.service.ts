import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { RedisService } from '../common/redis/redis.service'
import { Prisma, TransactionType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name)

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    })
    return user?.balance ?? 0
  }

  async credit(params: {
    userId: string
    amount: number
    type: TransactionType
    referenceId?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    if (params.amount <= 0) throw new BadRequestException('Credit amount must be positive')

    const idempotencyKey = `tx:${params.referenceId || uuidv4()}`
    const exists = await this.redis.get(idempotencyKey)
    if (exists) {
      this.logger.warn(`Duplicate transaction prevented: ${idempotencyKey}`)
      return
    }

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: params.userId },
        data: { balance: { increment: params.amount } },
      })

      await tx.transaction.create({
        data: {
          userId: params.userId,
          type: params.type,
          amount: params.amount,
          balanceBefore: user.balance - params.amount,
          balanceAfter: user.balance,
          referenceId: params.referenceId,
          metadata: (params.metadata || {}) as Prisma.InputJsonValue,
        },
      })
    })

    await this.redis.set(idempotencyKey, '1', 86400)
  }

  async debit(params: {
    userId: string
    amount: number
    type: TransactionType
    referenceId?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    if (params.amount <= 0) throw new BadRequestException('Debit amount must be positive')

    const lockKey = `wallet:${params.userId}`
    const locked = await this.redis.acquireLock(lockKey, 5000)
    if (!locked) throw new BadRequestException('Transaction in progress, please retry')

    try {
      const idempotencyKey = `tx:${params.referenceId || uuidv4()}`
      const exists = await this.redis.get(idempotencyKey)
      if (exists) {
        this.logger.warn(`Duplicate transaction prevented: ${idempotencyKey}`)
        return
      }

      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: params.userId } })
        if (!user || user.balance < params.amount) {
          throw new BadRequestException('Insufficient balance')
        }

        const updated = await tx.user.update({
          where: { id: params.userId },
          data: { balance: { decrement: params.amount } },
        })

        await tx.transaction.create({
          data: {
            userId: params.userId,
            type: params.type,
            amount: -params.amount,
            balanceBefore: updated.balance + params.amount,
            balanceAfter: updated.balance,
            referenceId: params.referenceId,
            metadata: (params.metadata || {}) as Prisma.InputJsonValue,
          },
        })
      })

      await this.redis.set(idempotencyKey, '1', 86400)
    } finally {
      await this.redis.releaseLock(lockKey)
    }
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ])
    return { transactions, total, page, limit }
  }
}
