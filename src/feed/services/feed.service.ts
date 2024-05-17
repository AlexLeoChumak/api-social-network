import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Observable, from } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';

import { FeedPostEntity } from '../models/feedPost.entity';
import { FeedPost } from '../models/feedPost.interface';
import { User } from 'src/auth/models/user.interface';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPostEntity)
    private readonly feedPostRepository: Repository<FeedPostEntity>,
  ) {}

  createPost(user: User, feedPost: FeedPost): Observable<FeedPost> {
    feedPost.author = user;
    return from(this.feedPostRepository.save(feedPost));
  }

  findAllPosts(): Observable<FeedPost[]> {
    return from(this.feedPostRepository.find());
  }

  // findPosts(take: number, skip: number): Observable<FeedPost[]> {
  //   return from(
  //     this.feedPostRepository.findAndCount({ take, skip }).then(([posts]) => {
  //       return <FeedPost[]>posts;
  //     }),
  //   );
  // }

  findPosts(take: number, skip: number): Observable<FeedPost[]> {
    return from(
      this.feedPostRepository
        .createQueryBuilder('feedPosts')
        .innerJoinAndSelect('feedPosts.author', 'author')
        .orderBy('feedPosts.createdAt', 'DESC')
        .take(take)
        .skip(skip)
        .getMany(),
    );
  }

  updatePost(id: number, feedPost: FeedPost): Observable<UpdateResult> {
    return from(this.feedPostRepository.update(id, feedPost));
  }

  deletePost(id: number): Observable<DeleteResult> {
    return from(this.feedPostRepository.delete(id));
  }

  findPostById(id: number): Observable<FeedPost> {
    return from(
      this.feedPostRepository.findOne({ where: { id }, relations: ['author'] }),
    );
  }
}
