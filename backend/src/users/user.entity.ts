import { Channels, Messages } from 'src/chat/chat.entity';
import { Game } from 'src/games/game.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('users')
@Unique(['name'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Channels)
  @JoinTable({
    name: 'channel_subscription',
    joinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'channel',
      referencedColumnName: 'id',
    },
  })
  channels: Channels[];

  @OneToMany(() => Channels, (channel) => channel.owner)
  owned: Channels[];

  @Column({ name: 'name' })
  name: string;

  @Column({ default: 'intraname' })
  intraname: string;

  @Column({ default: 'safepw' })
  password: string;

  @Column({ default: 'token' })
  token: string;

  @Column({ default: 'hashedToken' })
  hashedToken: string;

  @Column({ default: false })
  twoFAenabled: boolean;

  @Column({ default: 'twoFAsecret' })
  twoFAsecret: string;

  @Column({ default: 'tempTwoFAsecret' })
  tempTwoFAsecret: string;

  @Column({
    default: 'https://i.ds.at/XWrfig/rs:fill:750:0/plain/2020/01/16/harold.jpg',
  })
  profilePictureUrl: string;

  @Column('text', { array: true, default: [] })
  activeChats: string[];

  @Column({ default: 0 })
  tokenExpiry: number;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'friend_requests',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'friend_id',
      referencedColumnName: 'id',
    },
  })
  friend_requested: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'friend_requests_received',
    joinColumn: {
      name: 'friend_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  friend_requests_received: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'friends',
    joinColumn: {
      name: 'user_id', // This user
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'friend_id', // The friend
      referencedColumnName: 'id',
    },
  })
  friends: User[];
  @OneToMany(() => Game, (game) => game.winner)
  wonGames: Game[];

  @OneToMany(() => Game, (game) => game.looser)
  lostGames: Game[];

  @Column('jsonb', {
    default: [1000, 1000, 1000, 1000, 1000],
  })
  elo: number[];

  @Column('text', { nullable: true })
  customAvatar: string;

  @Column({ default: false })
  hasCustomAvatar: boolean;
}
