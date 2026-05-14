import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { InventoryService } from './inventory.service'

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('me')
  myInventory(@Req() req: any) {
    return this.inventoryService.getUserInventory(req.user.id)
  }
}
