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
    const allData: ILeaderboardLine[] = [];
    const allUsers: User[] = await this.userRepository.find({
      relations: ['wonGames', 'lostGames'],
    });
    allUsers.forEach((user) => {
      let wonGames: number = 0;
      user.wonGames.forEach((game) => {
        if (gamemode === '0' || gamemode === game.gamemode.toString())
          wonGames++;
      });
      let lostGames: number = 0;
      user.lostGames.forEach((game) => {
        if (gamemode === '0' || gamemode === game.gamemode.toString())
          lostGames++;
      });
      const newDataEntry: ILeaderboardLine = {
        intraname: user.intraname,
        nickname: user.name,
        elo: user.elo[user.elo.length - 1],
        wonGames: wonGames,
        winrate:
          wonGames || lostGames ? (wonGames * 100) / (wonGames + lostGames) : 0,
        totalGames: wonGames + lostGames,
      };
      allData.push(newDataEntry);
    });
    return allData;
  }
}
