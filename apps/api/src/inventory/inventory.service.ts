import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { RedisService } from '../common/redis/redis.service'
import { InventoryState } from '@prisma/client'

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getUserInventory(userId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { userId, state: 'AVAILABLE' },
      include: { skin: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async reserveItem(itemId: string, userId: string): Promise<void> {
    const lockKey = `inventory:${itemId}`
    const locked = await this.redis.acquireLock(lockKey, 30_000)
    if (!locked) throw new Error('Item is being processed, try again')

    try {
      const item = await this.prisma.inventoryItem.findFirst({
        where: { id: itemId, userId, state: 'AVAILABLE' },
      })
      if (!item) throw new NotFoundException('Item not available')

      await this.prisma.inventoryItem.update({
        where: { id: itemId },
        data: { state: InventoryState.RESERVED, reservedAt: new Date() },
      })
    } catch (err) {
      await this.redis.releaseLock(lockKey)
      throw err
    }
  }

  async releaseReservation(itemId: string): Promise<void> {
    await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: { state: InventoryState.AVAILABLE, reservedAt: null },
    })
    await this.redis.releaseLock(`inventory:${itemId}`)
  }

  async markDelivered(itemId: string): Promise<void> {
    await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: { state: InventoryState.DELIVERED },
    })
    await this.redis.releaseLock(`inventory:${itemId}`)
  }
}
