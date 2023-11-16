import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from '../users/user.entity';
import { EChannelType } from './properties';

@Entity('channels')
@Unique(['title'])
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.owned)
  @JoinColumn({ name: 'owner' })
  owner: User;

  @ManyToMany(() => User, (user) => user.channels)
  @JoinTable({
    name: 'channel_subscription',
    joinColumn: {
      name: 'channel',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
  })
  users: User[];

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'type' })
  type: EChannelType;
}

@Entity('messages')
export class Messages {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender' })
  sender: User;

  @ManyToOne(() => Channels)
  @JoinColumn({ name: 'channel' })
  channel: Channels;

  @Column({ name: 'content' })
  content: string;
}
