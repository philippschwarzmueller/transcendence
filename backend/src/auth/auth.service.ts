import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { hash as bcrypt_hash } from 'bcrypt';
import { Request } from 'express';
import * as sanitizeHtml from 'sanitize-html';
import { PublicUser } from 'src/users/users.service';

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

  async IntraSignIn(
    data: TokenResponse,
    hashedToken: string,
  ): Promise<IntraSignInEvent> {
    try {
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
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Network error or invalid request',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
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

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    let response: Response;
    try {
      response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientID,
          client_secret: this.clientSecret,
          code: code,
          redirect_uri: `http://${this.hostIP}:4000/auth/callback`,
        }),
      });
    } catch (e) {
      console.error(e);
      return null;
    }

    if (!response.ok) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Invalid response from authentication server',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const data: TokenResponse = await response.json();
    return data;
  }

  async hashToken(token: string): Promise<string> {
    const saltRounds: number = 10;
    const hashedToken: string = await bcrypt_hash(token, saltRounds);
    return hashedToken;
  }

  async checkToken(req: Request): Promise<User | null> {
    const token: string = req.cookies.token;
    const user: User = await this.usersRepository.findOne({
      where: {
        hashedToken: token,
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

  sanitizeInput(input: string): string {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }

  async checkNameChange(req: Request, newName: string): Promise<User | null> {
    if (!newName || !req.cookies.token) {
      return null;
    }
    const user: User = await this.checkToken(req);
    const token: string = user.token;
    const sanitizedNewName: string = this.sanitizeInput(newName);
    let userExists: boolean = await this.nameExists(sanitizedNewName);
    if (userExists) {
      return user;
    }
    userExists = await this.intranameExists(
      sanitizedNewName,
      user.intraname,
      token,
    );
    if (userExists) {
      return user;
    }
    const updatedUser: User = await this.changeName(sanitizedNewName, user);
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

  public createPublicUser(user: User): PublicUser {
    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      intraname: user.intraname,
      twoFAenabled: user.twoFAenabled,
      profilePictureUrl: user.profilePictureUrl,
      activeChats: user.activeChats,
      customAvatar: user.customAvatar,
      hasCustomAvatar: user.hasCustomAvatar,
      owned: user.owned,
      channels: user.channels,
      blocked:
        user.blocked && user.blocked.length > 0
          ? this.createPublicUserArray(user.blocked)
          : [],
      blocking:
        user.blocking && user.blocking.length > 0
          ? this.createPublicUserArray(user.blocking)
          : [],
      friend_requested:
        user.friend_requested && user.friend_requested.length > 0
          ? this.createPublicUserArray(user.friend_requested)
          : [],
      friend_requests_received:
        user.friend_requests_received &&
        user.friend_requests_received.length > 0
          ? this.createPublicUserArray(user.friend_requests_received)
          : [],
      friends:
        user.friends && user.friends.length > 0
          ? this.createPublicUserArray(user.friends)
          : [],
      wonGames: user.wonGames,
      lostGames: user.lostGames,
      elo: user.elo,
    };
    return publicUser;
  }

  public createPublicUserArray(users: User[]): PublicUser[] {
    const publicUsers: PublicUser[] = users.map((user) => {
      return this.createPublicUser(user);
    });
    return publicUsers;
  }
}
