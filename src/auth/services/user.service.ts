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
import { FriendRequest } from '../models/friend-request.interface';

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

  hasRequestBeenSentOrReceived(
    creator: User,
    receiver: User,
  ): Observable<boolean> {
    return from(
      this.friendRequestRepository.findOne({
        where: [
          { creator, receiver },
          { creator: receiver, receiver: creator },
        ],
      }),
    ).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if (!friendRequest) return of(false);
        return of(true);
      }),
    );
  }
}
