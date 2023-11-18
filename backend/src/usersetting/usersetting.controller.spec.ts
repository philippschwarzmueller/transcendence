import { Test, TestingModule } from '@nestjs/testing';
import { UsersettingController } from './usersetting.controller';
import { UsersettingService } from './usersetting.service';

describe('UsersettingController', () => {
  let controller: UsersettingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersettingController],
      providers: [UsersettingService],
    }).compile();

    controller = module.get<UsersettingController>(UsersettingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
