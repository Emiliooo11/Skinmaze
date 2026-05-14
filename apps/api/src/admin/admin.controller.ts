import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AdminService } from './admin.service'

// TODO: Replace with RolesGuard checking user.role === 'ADMIN'
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.getDashboardStats()
  }

  @Post('cases')
  createCase(@Body() body: any) {
    return this.adminService.createCase(body)
  }

  @Post('skins')
  createSkin(@Body() body: any) {
    return this.adminService.createSkin(body)
  }

  @Post('users/balance')
  adjustBalance(@Body() body: { userId: string; amount: number; reason: string }) {
    return this.adminService.adminAdjustBalance(body.userId, body.amount, body.reason)
  }
}
