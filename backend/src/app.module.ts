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
import { Channels, Messages, Muted } from './chat/chat.entity';
import { WSocketModule } from './wsocket/wsocket.module';
import { WSocketGateway } from './wsocket/wsocket.gateway';
import { TwoFAModule } from './2FA/twofa.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'root',
      password: 'testpwd',
      database: 'transcendence',
      entities: [User, Game, Messages, Channels, Muted],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    GamesModule,
    ChatModule,
    WSocketModule,
    TwoFAModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [GreetingService, WSocketGateway],
})
export class AppModule {}
