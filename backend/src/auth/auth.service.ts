import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { hash as bcrypt_hash, compare as bcrypt_compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async login(user: CreateUserDto) {
    const foundUser = await this.usersRepository.findOne({
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
      const saltRounds = 10;
      const hash = await bcrypt_hash(user.password, saltRounds);
      await this.usersRepository.insert({ ...user, password: hash });
      return { statusCode: 200, message: 'User created successfully' };
    } else {
      throw new Error('User already exists');
    }
  }

  async intraLogin(@Res() res): Promise<void> {
    const clientID: string = this.configService.get<string>('INTRA_CLIENT_ID');
    const url: string = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fcallback&response_type=code`;
    res.redirect(url);
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const clientID: string = this.configService.get<string>('INTRA_CLIENT_ID');
    const clientSecret: string =
      this.configService.get<string>('INTRA_SECRET_KEY');
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientID,
        client_secret: clientSecret,
        code,
        redirect_uri: 'http://localhost:4000/auth/callback',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    return data.access_token;
  }
}
