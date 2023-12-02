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

export interface IntraSignInEvent {
  user: User;
  firstLogin: boolean;
}

export function logTime(timestamp: number, msg: string) {
  const date = new Date(timestamp * 1000);
  console.log(`${msg}: ${date.toUTCString()}`);
}

@Injectable()
export class AuthService {
  private clientID: string;
  private clientSecret: string;
  private hostIP: string;
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.clientID = this.configService.get<string>('INTRA_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('INTRA_SECRET_KEY');
    this.hostIP = this.configService.get<string>('HOST_IP');
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

  async IntraSignIn(
    data: TokenResponse,
    hashedToken: string,
  ): Promise<IntraSignInEvent> {
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
    const intraname: string = res.login;
    const userExists = await this.usersRepository.exist({
      where: { intraname: intraname },
    });
    const signIn: IntraSignInEvent = {
      user: null,
      firstLogin: true,
    };
    if (userExists) {
      signIn.firstLogin = false;
      await this.setUserData(data, intraname, hashedToken);
    } else {
      signIn.firstLogin = true;
      const currentTime: number = Math.floor(Date.now() / 1000);
      await this.usersRepository.save(
        await this.usersRepository.create({
          name: intraname,
          intraname: intraname,
          profilePictureUrl: imageLink,
          token: data.access_token,
          hashedToken: hashedToken,
          tokenExpiry: currentTime + data.expires_in,
        }),
      );
    }

    const specificValue =
      'https://i.ds.at/XWrfig/rs:fill:750:0/plain/2020/01/16/harold.jpg';
    const userWithDefaultProfilePicture: User =
      await this.usersRepository.findOne({
        where: { intraname: intraname, profilePictureUrl: specificValue },
      });

    if (userWithDefaultProfilePicture) {
      await this.usersRepository.save({ profilePictureUrl: imageLink });
    }
    signIn.user = await this.usersRepository.findOne({
      where: { intraname: intraname },
    });
    return signIn;
  }

  async setUserData(
    data: TokenResponse,
    intraname: string,
    hashedToken: string,
  ) {
    const currentTime: number = Math.floor(Date.now() / 1000);
    await this.usersRepository.update(
      {
        intraname: intraname,
      },
      {
        token: data.access_token,
        tokenExpiry: currentTime + data.expires_in,
        hashedToken: hashedToken,
      },
    );
  }

  async intraLogin(@Res() res: any): Promise<void> {
    const url: string = `https://api.intra.42.fr/oauth/authorize?client_id=${this.clientID}&redirect_uri=http%3A%2F%2F${this.hostIP}%3A4000%2Fauth%2Fcallback&response_type=code`;
    res.redirect(url);
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse | null> {
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
          redirect_uri: `http://${this.hostIP}:4000/auth/callback`,
        }),
      },
    ).catch((e) => console.error(e));
    if (response instanceof Response && !response.ok) {
      return null;
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
    const user: User = await this.usersRepository.findOne({
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
    return currentTime < expirationTime;
  }

  async nameExists(newName: string): Promise<boolean> {
    const userExists: boolean = await this.usersRepository.exist({
      where: { name: newName },
    });
    return userExists;
  }

  async checkNameChange(
    hashedtoken: string,
    newName: string,
  ): Promise<User | null> {
    const user: User = await this.checkToken(hashedtoken);
    const token: string = user.token;
    let userExists: boolean = await this.nameExists(newName);
    if (userExists) {
      return user;
    }
    userExists = await this.intranameExists(newName, user.intraname, token);
    if (userExists) {
      return user;
    }
    const updatedUser: User = await this.changeName(newName, user);
    return updatedUser;
  }

  async intranameExists(
    newName: string,
    intraname: string,
    token: string,
  ): Promise<boolean> {
    let intraExists: boolean = await this.usersRepository.exist({
      where: { intraname: newName },
    });
    const response: Response | void = await fetch(
      `https://api.intra.42.fr/v2/users/${newName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const res = await response.json();
    if (res.login == newName && res?.campus[0].name == 'Heilbronn') {
      intraExists = true;
    }
    if (intraExists) {
      if (res.login == intraname) {
        intraExists = false;
      }
    }
    return intraExists;
  }

  async changeName(newName: string, currentUser: User): Promise<User | null> {
    await this.usersRepository.update(
      {
        intraname: currentUser.intraname,
      },
      {
        name: newName,
      },
    );
    const updatedUser: User = await this.usersRepository.findOne({
      where: {
        name: newName,
      },
    });
    return updatedUser;
  }
}
