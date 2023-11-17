import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EGamemode } from './properties';
import { User } from 'src/users/user.entity';

@Entity('games')
@Unique(['gameId'])
export class Game {
  @PrimaryGeneratedColumn()
  gameId: string;

  @ManyToOne(
    () => User,
    (winner) => {
      winner.wonGames;
    },
  )
  winner?: User;

  @ManyToOne(
    () => User,
    (looser) => {
      looser.lostGames;
    },
  )
  looser?: User;

  @Column({ nullable: true })
  winnerPoints?: number;

  @Column({ nullable: true })
  looserPoints?: number;

  @Column({ nullable: true })
  isFinished: boolean;

  @Column()
  gamemode: EGamemode;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt: Date;
}
