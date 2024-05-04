import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { FeedPostEntity } from '../models/feedPost.entity';
import { FeedPost } from '../models/feedPost.interface';
import { Observable, from } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPostEntity)
    private readonly feedPostRepository: Repository<FeedPostEntity>,
  ) {}

  createPost(feedPost: FeedPost): Observable<FeedPost> {
    return from(this.feedPostRepository.save(feedPost));
  }
}
