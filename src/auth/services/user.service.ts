import { Injectable } from '@nestjs/common';
import { Observable, catchError, from, map, tap, throwError } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from '../models/user.interface';
import { UserEntity } from '../models/user.entity';
import { TokenFromFront } from '../models/tokenFromFront.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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

  // updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
  //   const user: User = new UserEntity();
  //   user.id = id;
  //   user.imagePath = imagePath;

  //   return from(this.userRepository.update(id, user));
  // }

  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    return from(this.userRepository.update(id, { imagePath })).pipe(
      tap((res) => (res.raw = imagePath)),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  updatingTokenAfterImageChange(
    decodeToken: TokenFromFront,
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
}
