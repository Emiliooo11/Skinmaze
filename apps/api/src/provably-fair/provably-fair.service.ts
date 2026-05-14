import { Injectable } from '@nestjs/common'
import { createHmac, createHash, randomBytes } from 'crypto'
import { PrismaService } from '../common/prisma/prisma.service'

@Injectable()
export class ProvablyFairService {
  constructor(private prisma: PrismaService) {}

  generateServerSeed(): string {
    return randomBytes(32).toString('hex')
  }

  hashServerSeed(serverSeed: string): string {
    return createHash('sha256').update(serverSeed).digest('hex')
  }

  generateRoll(serverSeed: string, clientSeed: string, nonce: number): number {
    const message = `${clientSeed}:${nonce}`
    const hmac = createHmac('sha256', serverSeed).update(message).digest('hex')

    // Convert first 8 hex chars to decimal, map to 0-1 range
    const decimal = parseInt(hmac.slice(0, 8), 16)
    return decimal / 0xffffffff
  }

  rollToItemIndex(roll: number, totalWeight: number): number {
    return Math.floor(roll * totalWeight)
  }

  async getOrCreateActiveSeed(userId: string) {
    let seed = await this.prisma.seedPair.findFirst({
      where: { userId, active: true },
    })

    if (!seed) {
      const serverSeed = this.generateServerSeed()
      seed = await this.prisma.seedPair.create({
        data: {
          userId,
          serverSeed,
          serverSeedHash: this.hashServerSeed(serverSeed),
          clientSeed: randomBytes(8).toString('hex'),
          nonce: 0,
          active: true,
        },
      })
    }

    return seed
  }

  async rotateSeed(userId: string) {
    const current = await this.prisma.seedPair.findFirst({
      where: { userId, active: true },
    })

    if (current) {
      await this.prisma.seedPair.update({
        where: { id: current.id },
        data: { active: false },
      })
    }

    const serverSeed = this.generateServerSeed()
    return this.prisma.seedPair.create({
      data: {
        userId,
        serverSeed,
        serverSeedHash: this.hashServerSeed(serverSeed),
        clientSeed: randomBytes(8).toString('hex'),
        nonce: 0,
        active: true,
      },
    })
  }

  async incrementNonce(seedId: string): Promise<number> {
    const seed = await this.prisma.seedPair.update({
      where: { id: seedId },
      data: { nonce: { increment: 1 } },
    })
    return seed.nonce
  }

  async getSeedHistory(userId: string) {
    return this.prisma.seedPair.findMany({
      where: { userId, active: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }

  verifyRoll(serverSeed: string, clientSeed: string, nonce: number, expectedRoll: number): boolean {
    const roll = this.generateRoll(serverSeed, clientSeed, nonce)
    return Math.abs(roll - expectedRoll) < 0.000001
  }
}
