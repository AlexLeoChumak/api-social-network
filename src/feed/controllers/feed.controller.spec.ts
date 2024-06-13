import { Test, TestingModule } from '@nestjs/testing';
const httpMocks = require('node-mocks-http');

import { FeedController } from './feed.controller';
import { FeedService } from '../services/feed.service';

describe('FeedController', () => {
  let feedController: FeedController;
  let feedService: FeedService;

  const mockFeedService = {};

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [FeedService],
    })
      .overrideProvider(FeedService)
      .useValue(mockFeedService)
      .compile();

    feedService = moduleRef.get<FeedService>(FeedService);
    feedController = moduleRef.get<FeedController>(FeedController);
  });

  it('should be defined', () => {
    expect(feedController).toBeDefined();
  });
});
