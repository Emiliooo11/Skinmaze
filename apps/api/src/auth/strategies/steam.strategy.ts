import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { Strategy } from 'passport-steam'
import { AuthService } from '../auth.service'

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(
    private authService: AuthService,
    config: ConfigService,
  ) {
    super({
      returnURL: config.get('STEAM_CALLBACK_URL'),
      realm: config.get('STEAM_REALM'),
      apiKey: config.get('STEAM_API_KEY'),
    })
  }

  async validate(_identifier: string, profile: any) {
    return this.authService.validateSteamUser(profile)
  }
}
