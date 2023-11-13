import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { hash as bcrypt_hash, compare as bcrypt_compare } from 'bcrypt';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
  secret_valid_until: number;
}

export function logTime(timestamp: number, msg: string) {
  const date = new Date(timestamp * 1000);
  console.log(`${msg}: ${date.toUTCString()}`);
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

  async createIntraUser(
    data: TokenResponse,
    hashedToken: string,
  ): Promise<User> {
    const response: Response | void = await fetch(
      'https://api.intra.42.fr/v2/me',
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      },
    );
    const res = await response.json();
    const imageLink: string = res.image.versions.large;
    const user: string = res.login;

    const userExists = await this.usersRepository.exist({
      where: { name: user },
    });

    if (userExists) {
      await this.setUserData(data, user, hashedToken);
    } else {
      const currentTime: number = Math.floor(Date.now() / 1000);
      await this.usersRepository.insert({
        name: user,
        profilePictureUrl: imageLink,
        token: data.access_token,
        hashedToken: hashedToken,
        tokenExpiry: currentTime + data.expires_in,
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

  async setUserData(data: TokenResponse, user: string, hashedToken: string) {
    const currentTime: number = Math.floor(Date.now() / 1000);
    await this.usersRepository.update(
      {
        name: user,
      },
      {
        token: data.access_token,
        tokenExpiry: currentTime + data.expires_in,
        hashedToken: hashedToken,
      },
    );
  }

  async intraLogin(@Res() res: any): Promise<void> {
    const url: string = `https://api.intra.42.fr/oauth/authorize?client_id=${this.clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fcallback&response_type=code`;
    res.redirect(url);
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
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
      const data: TokenResponse = await response.json();
      return data;
    } else {
      throw new Error('Failed to fetch');
    }
  }

  async hashToken(token: string): Promise<string> {
    const saltRounds: number = 10;
    const hashedToken: string = await bcrypt_hash(token, saltRounds);
    return hashedToken;
  }

  async checkToken(frontendToken: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        hashedToken: frontendToken,
      },
    });
    if (!user) {
      return null;
    }
    const valid: boolean = await this.isValidToken(user.tokenExpiry);
    if (!valid) {
      return null;
    }
    return user;
  }

  isValidToken(expirationTime: number): boolean {
    const currentTime: number = Math.floor(Date.now() / 1000);
    // logTime(currentTime, 'Current Time');
    // logTime(expirationTime, 'Expiration Time from DatabaseToken');
    return currentTime < expirationTime;
  }

	async changeName(newName: string, currentUser: User): Promise<User | null> {
		await this.usersRepository.update(
      {
        name: currentUser.name,
      },
      {
				name: newName,
      },)
		return currentUser;
	}
}
