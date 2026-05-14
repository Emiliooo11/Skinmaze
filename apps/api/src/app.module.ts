import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './common/prisma/prisma.module'
import { RedisModule } from './common/redis/redis.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { WalletModule } from './wallet/wallet.module'
import { CasesModule } from './cases/cases.module'
import { MarketplaceModule } from './marketplace/marketplace.module'
import { InventoryModule } from './inventory/inventory.module'
import { ProvablyFairModule } from './provably-fair/provably-fair.module'
import { AdminModule } from './admin/admin.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    WalletModule,
    CasesModule,
    MarketplaceModule,
    InventoryModule,
    ProvablyFairModule,
    AdminModule,
  ],
})
export class AppModule {}
