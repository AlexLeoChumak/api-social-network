import { HttpStatus, INestApplication } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';

import { User } from '../src/auth/models/user.class';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const authUrl = `http://localhost:3000/api/auth`;

  const mockUser: User = {
    firstName: 'firstName1',
    lastName: 'lastName1',
    email: 'email4@homtail.com',
    password: 'password',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  xdescribe('/auth/register (POST)', () => {
    it('it should register a user and return the new user object', () => {
      return request(authUrl)
        .post('/register')
        .set('Accept', 'application/json')
        .send(mockUser)
        .expect((response: request.Response) => {
          const { id, firstName, lastName, password, email, imagePath, role } =
            response.body;

          expect(typeof id).toBe('number'),
            expect(firstName).toEqual(mockUser.firstName),
            expect(lastName).toEqual(mockUser.lastName),
            expect(email).toEqual(mockUser.email),
            expect(password).toBeUndefined();
          expect(imagePath).toBeNull();
          expect(role).toEqual('user');
        })
        .expect(HttpStatus.CREATED);
    });

    it('it should not register a new user if the passed email already exists', () => {
      return request(authUrl)
        .post('/register')
        .set('Accept', 'application/json')
        .send(mockUser)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('/auth/login (POST)', () => {
    it('it should not log in nor return a JWT for an unregistered user', () => {
      return request(authUrl)
        .post('/login')
        .set('Accept', 'application/json')
        .send({ email: 'doesnot@exist.com', password: 'password' })
        .expect((response: request.Response) => {
          const { token }: { token: string } = response.body;

          expect(token).toBeUndefined();
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('it should log in and return a JWT for a registered user', () => {
      return request(authUrl)
        .post('/login')
        .set('Accept', 'application/json')
        .send(mockUser)
        .expect((response: request.Response) => {
          const { token }: { token: string } = response.body;

          expect(jwt.verify(token, 'jwtsecret')).toBeTruthy();
        })
        .expect(HttpStatus.CREATED);
    });
  });
});
