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
import { WSocketGateway } from './wsocket/wsocket.gateway';
import { ChatService } from './chat/chat.service';
import { GamesService } from './games/games.service';
import { ChatDAO } from './chat/chat.dao';
import { UsersService } from './users/users.service';

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

    UsersModule,
    AuthModule,
    GamesModule,
    ChatModule,
    WSocketModule,
    TypeOrmModule.forFeature([User, Messages, Channels, Game]),
  ],
  controllers: [AppController],
  providers: [GreetingService, WSocketGateway, ChatService, GamesService, UsersService, ChatDAO, Map, Array],
})
export class AppModule {}
