import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity('channels')
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'password' })
  password: string;
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

