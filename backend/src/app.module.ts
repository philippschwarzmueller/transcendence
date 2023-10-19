import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GreetingService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseGame } from './games/game.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'root',
      password: 'testpwd',
      database: 'transcendence',
      entities: [User, DatabaseGame],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    GamesModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [GreetingService],
})
export class AppModule {}
