import { User } from './user.class';

export type FriendRequestStatusType =
  | 'not-sent'
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'waiting-for-current-user-response';

export interface FriendRequestStatus {
  status: FriendRequestStatusType;
}

export interface FriendRequest {
  id?: number;
  creator?: User;
  receiver?: User;
  status?: FriendRequestStatusType;
}
