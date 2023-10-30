import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('games')
@Unique(['gameId'])
export class Game {
  @PrimaryGeneratedColumn()
  gameId: string;

  @Column({ nullable: true })
  leftPlayer?: string;

  @Column({ nullable: true })
  rightPlayer?: string;

  @Column({ nullable: true })
  winner?: string;

  @Column({ nullable: true })
  looser?: string;

  @Column({ nullable: true })
  winnerPoints?: number;

  @Column({ nullable: true })
  looserPoints?: number;

  @Column({ nullable: true })
  isFinished: boolean;
}
