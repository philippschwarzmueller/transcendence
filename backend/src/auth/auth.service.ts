import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { hash as bcrypt_hash, compare as bcrypt_compare } from 'bcrypt';

interface tokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
  secret_valid_until: number;
}

@Injectable()
export class AuthService {
  private clientID: string;
  private clientSecret: string;
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.clientID = this.configService.get<string>('INTRA_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('INTRA_SECRET_KEY');
  }

  async login(user: CreateUserDto) {
    const foundUser: User = await this.usersRepository.findOne({
      where: { name: user.name },
    });

    if (!foundUser) {
      throw new Error('User not found');
    }

    const passwordMatch: boolean = await bcrypt_compare(
      user.password,
      foundUser.password,
    );

    if (!passwordMatch) {
      throw new Error('Wrong password');
    }

    return {
      message: 'Login successful',
    };
  }

  async signup(user: CreateUserDto): Promise<any> {
    let userExists = await this.usersRepository.exist({
      where: { name: user.name },
    });
    if (!userExists) {
      const saltRounds: number = 10;
      const hash: string = await bcrypt_hash(user.password, saltRounds);
      await this.usersRepository.insert({ ...user, password: hash });
      return { statusCode: 200, message: 'User created successfully' };
    } else {
      throw new Error('User already exists');
    }
  }

  async intraLogin(@Res() res: any): Promise<void> {
		console.log("intra Login gets called")
    const url: string = `https://api.intra.42.fr/oauth/authorize?client_id=${this.clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fget-token&response_type=code`;
    res.redirect(url);
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response: any = await fetch(
      'https://api.intra.42.fr/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientID,
          client_secret: this.clientSecret,
          code: code,
          redirect_uri: 'http://localhost:3000/get-token',
        }),
      },
    ).catch(e => console.error(e));

/*     if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    } */

    const data: any = await response.json();
    return data.access_token;
  }
}
