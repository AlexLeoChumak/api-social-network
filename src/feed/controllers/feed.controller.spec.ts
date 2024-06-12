import { Test, TestingModule } from '@nestjs/testing';
const httpMocks = require('node-mocks-http');

import { FeedController } from './feed.controller';
import { FeedService } from '../services/feed.service';

describe('FeedController', () => {
  let service: FeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedService],
    }).compile();

    service = module.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
