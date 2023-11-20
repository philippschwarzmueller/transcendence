import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Game } from 'src/games/game.entity';

export interface ILeaderboardLine {
  intraname: string;
  nickname: string;
  elo: number;
  wonGames: number;
  winrate: number;
  totalGames: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async getData(gamemode: string): Promise<ILeaderboardLine[]> {
    return [];
  }
}
