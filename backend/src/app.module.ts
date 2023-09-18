import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { GreetingService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersService } from './user/users.service';

@Module({
 // imports: [
 //   TypeOrmModule.forRoot({
 //     type: 'postgres',
 //     host: 'db',
 //     port: 5432,
 //     username: 'postgres',
 //     password: 'testpwd',
 //     database: 'postgres',
 //     //entities: [User],
 //     synchronize: true
 //   }),
 // ],
  controllers: [AppController, AuthController],
  providers: [GreetingService, AuthService, UsersService],
})
export class AppModule {}
