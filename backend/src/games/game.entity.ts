import {
  Column,
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

  @Column({ nullable: true })
  leftPlayer?: string;

  @Column({ nullable: true })
  rightPlayer?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'winner' })
  winner?: User;

  // @Column({ nullable: true })
  // winner?: User;

  @Column({ nullable: true })
  looser?: string;

  @Column({ nullable: true })
  winnerPoints?: number;

  @Column({ nullable: true })
  looserPoints?: number;

  @Column({ nullable: true })
  isFinished: boolean;

  @Column()
  gamemode: EGamemode;
}
