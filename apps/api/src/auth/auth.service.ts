import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateSteamUser(profile: {
    id: string
    displayName: string
    photos: { value: string }[]
    profileUrl: string
  }) {
    const user = await this.usersService.upsertBySteamId({
      steamId: profile.id,
      username: profile.displayName,
      avatar: profile.photos[0]?.value || '',
      profileUrl: profile.profileUrl,
    })
    return user
  }

  signToken(userId: string, steamId: string): string {
    return this.jwtService.sign({ sub: userId, steamId })
  }
}
