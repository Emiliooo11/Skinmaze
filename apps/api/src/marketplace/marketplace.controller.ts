import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { MarketplaceService } from './marketplace.service'
import { IsNumber, IsString, Min } from 'class-validator'

class ListItemDto {
  @IsString() itemId!: string
  @IsNumber() @Min(0.01) price!: number
}

@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get('listings')
  getListings(
    @Query('page') page = '1',
    @Query('limit') limit = '24',
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('rarity') rarity?: string,
    @Query('wear') wear?: string,
  ) {
    return this.marketplaceService.getListings({
      page: +page,
      limit: +limit,
      search,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      rarity,
      wear,
    })
  }

  @Post('list')
  @UseGuards(AuthGuard('jwt'))
  listItem(@Req() req: any, @Body() dto: ListItemDto) {
    return this.marketplaceService.listItem(req.user.id, dto.itemId, dto.price)
  }

  @Post('buy/:listingId')
  @UseGuards(AuthGuard('jwt'))
  buyItem(@Param('listingId') listingId: string, @Req() req: any) {
    return this.marketplaceService.buyItem(req.user.id, listingId)
  }

  @Delete('listings/:listingId')
  @UseGuards(AuthGuard('jwt'))
  cancelListing(@Param('listingId') listingId: string, @Req() req: any) {
    return this.marketplaceService.cancelListing(req.user.id, listingId)
  }
}
