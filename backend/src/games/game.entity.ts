import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('games')
@Unique(['gameId'])
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  winner: string;

  @Column()
  looser: string;
}
