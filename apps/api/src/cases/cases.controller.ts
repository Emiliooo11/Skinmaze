import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CasesService } from './cases.service'

@Controller('cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  findAll() {
    return this.casesService.findAll()
  }

  @Get('feed')
  globalFeed(@Query('limit') limit = '20') {
    return this.casesService.getGlobalFeed(+limit)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id)
  }

  @Post(':id/open')
  @UseGuards(AuthGuard('jwt'))
  openCase(@Param('id') id: string, @Req() req: any) {
    return this.casesService.openCase(req.user.id, id)
  }

  @Get('history/me')
  @UseGuards(AuthGuard('jwt'))
  myHistory(@Req() req: any, @Query('page') page = '1') {
    return this.casesService.getOpeningHistory(req.user.id, +page)
  }
}
