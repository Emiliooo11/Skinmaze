import { Module } from '@nestjs/common'
import { ProvablyFairService } from './provably-fair.service'
import { ProvablyFairController } from './provably-fair.controller'

@Module({
  controllers: [ProvablyFairController],
  providers: [ProvablyFairService],
  exports: [ProvablyFairService],
})
export class ProvablyFairModule {}
