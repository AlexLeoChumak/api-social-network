import { Injectable } from '@nestjs/common';
import {
  Observable,
  catchError,
  from,
  map,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from '../models/user.interface';
import { UserEntity } from '../models/user.entity';
import { DecodeTokenFromFront } from '../models/decodeTokenFromFront.interface';
import { FriendRequestEntity } from '../models/friend-request.entity';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequestStatusType,
} from '../models/friend-request.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>,

    private jwtService: JwtService,
  ) {}

  findUserByid(id: number): Observable<User> {
    return from(
      this.userRepository.findOne({ where: { id }, relations: ['feedPosts'] }),
    ).pipe(
      map((user: User) => {
        delete user.password;
        return user;
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    return from(this.userRepository.update(id, { imagePath })).pipe(
      map((response) => ({
        ...response,
        imagePath,
      })),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  updatingTokenAfterChangingProfilePicture(
    decodeToken: DecodeTokenFromFront,
  ): Observable<string> {
    if (decodeToken) {
      const { user, iat } = decodeToken;

      return from(this.jwtService.signAsync({ user, iat })).pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
      );
    }
  }

  findImageNameByUserId(id: number): Observable<string> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      map((user: User) => {
        delete user.password;
        return user.imagePath;
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  //проверяет, была ли отправлена или получена заявка на дружбу между двумя пользователями
  hasRequestBeenSentOrReceived(
    creator: User,
    receiver: User,
  ): Observable<boolean> {
    return from(
      this.friendRequestRepository.findOne({
        where: [
          { creator: { id: creator.id }, receiver: { id: receiver.id } },
          { creator: { id: receiver.id }, receiver: { id: creator.id } },
        ],
      }),
    ).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if (!friendRequest) return of(false);
        return of(true);
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  //инициатор отправляет запрос на добавление в друзья
  sendFriendRequest(
    receiverId: number,
    creator: User,
  ): Observable<FriendRequest | { error: string }> {
    if (receiverId === creator.id) {
      return of({ error: 'It is not possible to add yourself' });
    }

    return this.findUserByid(receiverId).pipe(
      switchMap((receiver: User) => {
        return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
          switchMap((hasRequestBeenSentOrReceived: boolean) => {
            if (hasRequestBeenSentOrReceived) {
              return of({
                error:
                  'A friend request has already been sent of received to your account!',
              });
            }

            const friendRequest: FriendRequest = {
              creator,
              receiver,
              status: 'pending',
            };

            return from(this.friendRequestRepository.save(friendRequest));
          }),
        );
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  //статус запроса в друзья
  getFriendRequestStatus(
    receiverId: number,
    currentUser: User,
  ): Observable<FriendRequestStatus> {
    return this.findUserByid(receiverId).pipe(
      switchMap((receiver: User) => {
        return from(
          this.friendRequestRepository.findOne({
            where: [
              {
                creator: { id: currentUser.id },
                receiver: { id: receiver.id },
              },
              {
                creator: { id: receiver.id },
                receiver: { id: currentUser.id },
              },
            ],
            relations: ['creator', 'receiver'],
          }),
        );
      }),
      switchMap((friendRequest: FriendRequest) => {
        if (friendRequest?.receiver.id === currentUser.id) {
          return of({
            status:
              'waiting-for-current-user-response' as FriendRequestStatusType,
          });
        }
        return of({ status: friendRequest?.status || 'not-sent' });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  getFriendRequestUserById(friendRequestId: number): Observable<FriendRequest> {
    return from(
      this.friendRequestRepository.findOne({
        where: [{ id: friendRequestId }],
      }),
    ).pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  respondToFriendRequest(
    friendRequestId: number,
    statusResponse: FriendRequestStatus,
  ): Observable<FriendRequest> {
    return this.getFriendRequestUserById(friendRequestId).pipe(
      switchMap((friendRequest: FriendRequest) => {
        return from(
          this.friendRequestRepository.save({
            ...friendRequest,
            status: statusResponse.status,
          }),
        );
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  getFriendRequestsFromRecipients(user: User): Observable<FriendRequest[]> {
    return from(
      this.friendRequestRepository.find({
        where: [{ receiver: user }],
        relations: ['receiver', 'creator'],
      }),
    ).pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }
}
