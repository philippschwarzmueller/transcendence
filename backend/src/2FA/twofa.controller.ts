import { Controller, Post, Body, HttpCode, Req, Get } from '@nestjs/common';
import { TwoFAService } from './twofa.service';
import { User } from '../users/user.entity';
import { Response, Request } from 'express';

@Controller('twofa')
export class TwoFAController {
  constructor(private twoFAservice: TwoFAService) {}

  @Post('get-2FA-qrcode')
  @HttpCode(200)
  async getQrCode(@Req() req: Request): Promise<string> {
    const hashedtoken = req.cookies.token;
    const image = await this.twoFAservice.getQrCode(hashedtoken);
    return image;
  }

  @Post('enable-2FA')
  @HttpCode(200)
  async enable2FA(
    @Req() req: Request,
    @Body() body: { twoFaCode: string },
  ): Promise<boolean> {
    const hashedtoken = req.cookies.token;
    const verified: boolean = await this.twoFAservice.enable2FA(
      body.twoFaCode,
      hashedtoken,
    );
    return verified;
  }

  @Post('disable-2FA')
  @HttpCode(200)
  async disable2FA(@Req() req: Request): Promise<boolean> {
    const hashedtoken = req.cookies.token;
    const done: boolean = await this.twoFAservice.disable2FA(hashedtoken);
    return done;
  }

  @Post('login-2FA')
  @HttpCode(200)
  async twoFaLogin(
    @Req() req: Request,
    @Body() body: { twoFaCode: string },
  ): Promise<boolean> {
    const hashedtoken = req.cookies.token;
    const verified: boolean = await this.twoFAservice.verify2FA(
      body.twoFaCode,
      hashedtoken,
    );
    return verified;
  }
}
