import { User } from './user.class';

export interface DecodeTokenFromFront {
  user: User;
  iat: number;
  exp: number;
}
