import { FeedPost } from 'src/feed/models/feedPost.interface';
import { Role } from './role.enum';

export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: Role;
  feedPosts?: FeedPost[];
}
