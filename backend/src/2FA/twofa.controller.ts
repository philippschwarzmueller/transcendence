import { Controller, Post, Body, HttpCode, Req } from '@nestjs/common';
import { TwoFAService } from './twofa.service';
import { authenticator } from 'otplib';
import { Response, Request } from 'express';
import qrcode from 'qrcode';

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
		console.log(body.twoFaCode);
    const verified: boolean = await this.twoFAservice.enable2FA(
			body.twoFaCode,
      hashedtoken,
    );
		return verified;
  }

}
