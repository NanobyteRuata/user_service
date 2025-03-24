import { Session } from 'src/sessions/session.entity';
import { User } from 'src/users/user.entity';

export class SessionDto {
  id: number;
  deviceId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;

  constructor(session: Session) {
    this.id = session.id;
    this.deviceId = session.deviceId;
    this.expiresAt = session.expiresAt;
    this.createdAt = session.createdAt;
    this.updatedAt = session.updatedAt;
    this.user = session.user;
  }
}
