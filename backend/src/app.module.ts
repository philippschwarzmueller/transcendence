import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { GreetingService } from './app.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

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
