import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwoFAController } from './twofa.controller';
import { TwoFAService } from './twofa.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule.forRoot()],
  controllers: [TwoFAController],
  providers: [TwoFAService],
})
export class TwoFAModule {}
