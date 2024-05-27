import { User } from './user.interface';

export interface DecodeTokenFromFront {
  user: User;
  iat: number;
  exp: number;
}
