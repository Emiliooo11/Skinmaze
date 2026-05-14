import { Module } from '@nestjs/common'
import { CasesController } from './cases.controller'
import { CasesService } from './cases.service'
import { WalletModule } from '../wallet/wallet.module'
import { ProvablyFairModule } from '../provably-fair/provably-fair.module'
import { InventoryModule } from '../inventory/inventory.module'

@Module({
  imports: [WalletModule, ProvablyFairModule, InventoryModule],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
