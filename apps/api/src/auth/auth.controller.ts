import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  steamLogin() {
    // Redirects to Steam
  }

  @Get('steam/callback')
  @UseGuards(AuthGuard('steam'))
  async steamCallback(@Req() req: any, @Res() res: Response) {
    const token = this.authService.signToken(req.user.id, req.user.steamId)
    const appUrl = this.config.get('APP_URL') || 'http://localhost:3000'

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.redirect(`${appUrl}/`)
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('token')
    res.json({ success: true })
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    return req.user
  }
}
