import { Module } from '@nestjs/common';
import { FeedPostEntity } from './models/feedPost.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeedService } from './services/feed.service';
import { FeedController } from './controllers/feed.controller';
import { Repository } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { IsCreatorGuard } from './guards/is-creator.guard';

@Module({
  imports: [TypeOrmModule.forFeature([FeedPostEntity]), AuthModule],
  providers: [FeedService, Repository, IsCreatorGuard],
  controllers: [FeedController],
})
export class FeedModule {}
