import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class TwoFAService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async getUser(hashedToken: string): Promise<User> {
    const foundUser: User = await this.usersRepository.findOne({
      where: { hashedToken: hashedToken },
    });
    return foundUser;
  }

  async updateValue(intraname: string, key: string, value: string | boolean) {
    await this.usersRepository.update(
      {
        intraname: intraname,
      },
      {
        [key]: value,
      },
    );
  }

  async getQrCode(hashedToken: string): Promise<string> {
    const user: User = await this.getUser(hashedToken);
    const tempSecret: string = authenticator.generateSecret();
    await this.updateValue(user.intraname, 'tempTwoFAsecret', tempSecret);
    const uri: string = authenticator.keyuri(
      user.intraname,
      'Transcendence',
      tempSecret,
    );
    const qrImage: string = await toDataURL(uri);
    return qrImage;
  }

  async disable2FA(hashedToken: string): Promise<void> {
    const user: User = await this.getUser(hashedToken);
    await this.updateValue(user.intraname, 'twoFAenabled', false);
  }

  async enable2FA(code: string, hashedToken: string): Promise<boolean> {
    const user: User = await this.getUser(hashedToken);
    const verified: boolean = await authenticator.check(
      code,
      user.tempTwoFAsecret,
    );
    if (verified) {
      await this.updateValue(user.intraname, 'twoFAenabled', true);
      await this.updateValue(
        user.intraname,
        'twoFAsecret',
        user.tempTwoFAsecret,
      );
    }
    return verified;
  }
}
