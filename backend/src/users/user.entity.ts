import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('users')
@Unique(['name'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ default: 'safepw' })
  password: string;

  @Column({ default: undefined })
  token: string;

  @Column({
    default: 'https://i.ds.at/XWrfig/rs:fill:750:0/plain/2020/01/16/harold.jpg',
  })
  profilePictureUrl: string;
}
