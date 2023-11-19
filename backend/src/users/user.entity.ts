import { Channels } from 'src/chat/chat.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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
    name: 'pending_friend_list', //blocked list
    joinColumn: {
      name: 'requesting_friend', //blocking
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'received_friend_request', //blocked
      referencedColumnName: 'id',
    },
  })
  friend_requested: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'pending_friend_list',
    joinColumn: {
      name: 'received_friend_request',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'requesting_friend',
      referencedColumnName: 'id',
    },
  })
  friend_requests_received: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'friends',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'friend_id',
      referencedColumnName: 'id',
    },
  })
  friends: User[];
}
