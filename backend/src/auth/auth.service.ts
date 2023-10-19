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

    return foundUser;
  }

  async signup(user: CreateUserDto): Promise<any> {
    const userExists = await this.usersRepository.exist({
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

  async createIntraUser(token: string): Promise<User> {
    const response: Response | void = await fetch(
      'https://api.intra.42.fr/v2/me',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    const imageLink: string = data.image.versions.large;
    const user: string = data.login;

    const userExists = await this.usersRepository.exist({
      where: { name: user },
    });

    if (!userExists) {
      await this.usersRepository.insert({
        name: user,
        profilePictureUrl: imageLink,
      });
    }

    const specificValue =
      'https://i.ds.at/XWrfig/rs:fill:750:0/plain/2020/01/16/harold.jpg';
    const userWithDefaultProfilePicture = await this.usersRepository.findOne({
      where: { name: user, profilePictureUrl: specificValue },
    });

    if (userWithDefaultProfilePicture) {
      await this.usersRepository.save({ profilePictureUrl: imageLink });
    }
    return this.usersRepository.findOne({ where: { name: user } });
  }

  async intraLogin(@Res() res: any): Promise<void> {
    const url: string = `https://api.intra.42.fr/oauth/authorize?client_id=${this.clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fcallback&response_type=code`;
    res.redirect(url);
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response: Response | void = await fetch(
      'https://api.intra.42.fr/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientID,
          client_secret: this.clientSecret,
          code: code,
          redirect_uri: 'http://localhost:4000/auth/callback',
        }),
      },
    ).catch((e) => console.error(e));
    if (response instanceof Response && !response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    if (response instanceof Response && response.ok) {
      const data: tokenResponse = await response.json();
      return data.access_token;
    } else {
      throw new Error('Failed to fetch');
    }
  }
}
