import {
  Controller,
	Post,
	HttpCode,
	Req,
} from '@nestjs/common';
import { TwoFAService } from './twofa.service';
import { authenticator } from 'otplib';
import { Response, Request } from 'express';
import qrcode from 'qrcode';


@Controller('twofa')
export class TwoFAController {
  constructor(private twoFAservice: TwoFAService) {}
  
	@Post('enable')
	@HttpCode(200)
	async enable2FA(@Req() req: Request): Promise<string> {
		const hashedtoken = req.cookies.token;
		const image = await this.twoFAservice.enable2FA(hashedtoken);
		return image;
	}
}
