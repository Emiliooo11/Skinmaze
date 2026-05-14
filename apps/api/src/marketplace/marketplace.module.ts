import { Module } from '@nestjs/common'
import { MarketplaceController } from './marketplace.controller'
import { MarketplaceService } from './marketplace.service'
import { WalletModule } from '../wallet/wallet.module'
import { InventoryModule } from '../inventory/inventory.module'

@Module({
  imports: [WalletModule, InventoryModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
