import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ProvablyFairService } from './provably-fair.service'
import { IsString } from 'class-validator'

class SetClientSeedDto {
  @IsString()
  clientSeed!: string
}

class VerifyRollDto {
  @IsString() serverSeed!: string
  @IsString() clientSeed!: string
  nonce!: number
  roll!: number
}

@Controller('provably-fair')
export class ProvablyFairController {
  constructor(private provablyFairService: ProvablyFairService) {}

  @Get('seed')
  @UseGuards(AuthGuard('jwt'))
  async getActiveSeed(@Req() req: any) {
    const seed = await this.provablyFairService.getOrCreateActiveSeed(req.user.id)
    return {
      serverSeedHash: seed.serverSeedHash,
      clientSeed: seed.clientSeed,
      nonce: seed.nonce,
    }
  }

  @Post('seed/rotate')
  @UseGuards(AuthGuard('jwt'))
  async rotateSeed(@Req() req: any) {
    return this.provablyFairService.rotateSeed(req.user.id)
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async getSeedHistory(@Req() req: any) {
    return this.provablyFairService.getSeedHistory(req.user.id)
  }

  @Post('verify')
  verify(@Body() dto: VerifyRollDto) {
    const valid = this.provablyFairService.verifyRoll(
      dto.serverSeed,
      dto.clientSeed,
      dto.nonce,
      dto.roll,
    )
    return { valid }
  }
}
