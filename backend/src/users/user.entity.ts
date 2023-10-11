import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('users')
@Unique(['name'],)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ default: 'safepw' })
  password: string;

	@Column({ default: 'default-image-url.jpg' })
	profilePictureUrl: string;
}
