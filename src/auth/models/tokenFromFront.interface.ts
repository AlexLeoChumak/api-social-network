import { User } from './user.interface';

export interface TokenFromFront {
  user: User;
  iat: number;
  exp: number;
}
