import { Auth } from 'src/auth/auth.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
  auth?: Auth;
}
