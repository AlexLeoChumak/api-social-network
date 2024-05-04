import { Module } from '@nestjs/common';
import { FeedPostEntity } from './models/feedPost.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeedService } from './services/feed.service';
import { FeedController } from './controllers/feed.controller';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FeedPostEntity])],
  providers: [FeedService, Repository],
  controllers: [FeedController],
})
export class FeedModule {}
