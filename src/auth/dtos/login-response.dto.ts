import { User } from 'src/users/user.entity';
import { Tokens } from '../models/tokens.model';

export class LoginResponse {
  tokens: Tokens;
  user: User;
}
