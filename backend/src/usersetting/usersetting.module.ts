import { Module } from '@nestjs/common';
import { UsersettingService } from './usersetting.service';
import { UsersettingController } from './usersetting.controller';

@Module({
  controllers: [UsersettingController],
  providers: [UsersettingService],
})
export class UsersettingModule {}
