import { User } from './user.interface';

export type FriendRequestStatusType = 'pending' | 'accepted' | 'declined';

//??????????
export interface FriendRequestStatus {
  status?: FriendRequestStatusType;
}

export interface FriendRequest {
  id?: number;
  creator?: User;
  receiver?: User;
  status?: FriendRequestStatusType;
}
