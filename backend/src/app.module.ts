import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GreetingService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { ChatModule } from './chat/chat.module';
import { Game } from './games/game.entity';
import { Channels, Messages } from './chat/chat.entity';
import { WSocketModule } from './wsocket/wsocket.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'root',
      password: 'testpwd',
      database: 'transcendence',
      entities: [User, Game, Messages, Channels],
      synchronize: true,
    }),
    WSocketModule,
    UsersModule,
    AuthModule,
    GamesModule,
    ChatModule,

  ],
  controllers: [AppController],
  providers: [GreetingService],
})
export class AppModule {}
