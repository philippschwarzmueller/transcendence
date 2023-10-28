import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity('channels')
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.channels)
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
