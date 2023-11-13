import { Channels, Messages } from 'src/chat/chat.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('users')
@Unique(['name'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(type => Channels)
  @JoinTable({
      name: "channel_subscription",
      joinColumn: {
          name: "user",
          referencedColumnName: "id"
      },
      inverseJoinColumn: {
          name: "channel",
          referencedColumnName: "id"
      }
  })
  channels: Channels[];

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

  @Column({
    default: 'https://i.ds.at/XWrfig/rs:fill:750:0/plain/2020/01/16/harold.jpg',
  })
  profilePictureUrl: string;

  @Column('text', { array: true, default: [] })
  activeChats: string[];

  @Column({default: 0, })
  tokenExpiry: number;
}
