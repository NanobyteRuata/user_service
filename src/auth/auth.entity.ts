import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.auth, { cascade: ['insert'] })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  password: string;
}
