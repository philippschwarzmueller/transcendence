import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('games')
@Unique(['gameId'])
export class Game {
  @PrimaryGeneratedColumn()
  gameId: number;

  @Column()
  winner: string;

  @Column()
  looser: string;
}
