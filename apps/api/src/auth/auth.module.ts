import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { SteamStrategy } from './strategies/steam.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SteamStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
