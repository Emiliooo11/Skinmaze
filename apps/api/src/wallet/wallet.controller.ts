import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { WalletService } from './wallet.service'

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  balance(@Req() req: any) {
    return this.walletService.getBalance(req.user.id)
  }

  @Get('transactions')
  transactions(@Req() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.walletService.getTransactions(req.user.id, +page, +limit)
  }
}
