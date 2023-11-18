import { Test, TestingModule } from '@nestjs/testing';
import { UsersettingService } from './usersetting.service';

describe('UsersettingService', () => {
  let service: UsersettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersettingService],
    }).compile();

    service = module.get<UsersettingService>(UsersettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
