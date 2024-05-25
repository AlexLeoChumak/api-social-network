import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 12)).pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  registerAccount(user: User): Observable<User> {
    return this.hashPassword(user.password).pipe(
      switchMap((hashedPassword: string) => {
        return from(
          this.userRepository.save({
            ...user,
            password: hashedPassword,
          }),
        );
      }),
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

  // метод registerAccount до оптимизации
  //
  // registerAccount(user: User): Observable<User> {
  //   const { firstName, lastName, email, password } = user;

  //   return this.hashPassword(password).pipe(
  //     switchMap((hashedPassword: string) => {
  //       return from(
  //         this.userRepository.save({
  //           firstName,
  //           lastName,
  //           email,
  //           password: hashedPassword,
  //         }),
  //       ).pipe(
  //         map((user: User) => {
  //           delete user.password;
  //           return user;
  //         }),
  //         catchError((err) => {
  //           console.error(err);
  //           return throwError(() => err);
  //         }),
  //       );
  //     }),
  //   );
  // }

  validateUser(email: string, password: string): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: { email },
        select: [
          'id',
          'firstName',
          'lastName',
          'email',
          'password',
          'role',
          'imagePath',
        ],
      }),
    ).pipe(
      switchMap((user: User) => {
        if (!user || !user.email) {
          return throwError(() => new Error('User not found'));
        }

        return from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              delete user.password;
              return user;
            }
          }),
        );
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  login(user: User): Observable<string> {
    const { email, password } = user;

    return this.validateUser(email, password).pipe(
      switchMap((user: User) => {
        if (user) {
          return from(this.jwtService.signAsync({ user }));
        }
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }
}
