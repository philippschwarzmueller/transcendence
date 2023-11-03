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

@Entity('channels')
@Unique(['title'])
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

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
