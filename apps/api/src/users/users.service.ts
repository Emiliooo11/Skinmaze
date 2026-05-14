import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findBySteamId(steamId: string) {
    return this.prisma.user.findUnique({ where: { steamId } })
  }

  async upsertBySteamId(data: {
    steamId: string
    username: string
    avatar: string
    profileUrl: string
  }) {
    return this.prisma.user.upsert({
      where: { steamId: data.steamId },
      create: {
        steamId: data.steamId,
        username: data.username,
        avatar: data.avatar,
        profileUrl: data.profileUrl,
        balance: 0,
        xp: 0,
        level: 1,
        role: 'USER',
      },
      update: {
        username: data.username,
        avatar: data.avatar,
        profileUrl: data.profileUrl,
      },
    })
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ])
    return { users, total, page, limit }
  }

  async banUser(id: string, banned: boolean) {
    return this.prisma.user.update({ where: { id }, data: { banned } })
  }
}
