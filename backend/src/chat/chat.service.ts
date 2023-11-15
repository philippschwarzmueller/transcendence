import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { IMessage } from './properties';
import { ChatDAO } from './chat.dao';
import { Server } from 'socket.io';
import { IGameUser } from 'src/games/properties';
import { GamesService } from 'src/games/games.service';
import { ChatServiceBase } from './chat.servicebase';

@Injectable()
export class ChatService extends ChatServiceBase {
  constructor(
    @Inject(UsersService)
    protected userService: UsersService,
    @Inject(ChatDAO)
    protected chatDao: ChatDAO,
  ) {
    super(userService, chatDao);
  }

  async handleMessage(data: IMessage, server: Server, gameServ: GamesService) {
    let check = data.input;
    if (data.input.indexOf(' ') != -1)
      check = data.input.substring(0, data.input.indexOf(' '));
    switch (check) {
      case '/add':
        this.addUser(data, server);
        break;
      case '/kick':
        this.kickUser(data, server);
        break;
      case '/promote':
        break;
      case '/demote':
        break;
      case '/mute':
        break;
      case '/challenge': {
        this.gameInvite(data, server);
        break;
      }
      default:
        this.printVanillaMessage(data, server, gameServ);
    }
  }

  private async printVanillaMessage(
    data: IMessage,
    server: Server,
    gameServ: GamesService,
  ) {
    if (this.opponents.get(data.user.name)) {
      await this.gameAccept(data, server, gameServ);
      return;
    }
    try {
      const mess = `${data.user.name}: ${data.input}`;
      server.to(data.room).emit('message', mess);
      await this.chatDao.saveMessageToChannel(data);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  private async addUser(data: IMessage, server: Server) {
    try {
      const name = data.input.substring(data.input.indexOf(' ') + 1);
      const owner = await this.chatDao.getChannelOwner(data.room);
      if (owner.name !== data.user.name) return;
      await this.chatDao.addUserToChannel(data.room, name);
      server
        .to(this.getUser(name).socket.id)
        .emit(
          'invite',
          await this.chatDao.getUserChannels(this.getUser(name).user.id),
        );
        server.to(data.room).emit(`${name}: got added`)
        this.chatDao.saveMessageToChannel({user: data.user, input: 'got added', room: data.room });
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  private async kickUser(data: IMessage, server: Server) {
    try {
      const name = data.input.substring(data.input.indexOf(' ') + 1);
      const owner = await this.chatDao.getChannelOwner(data.room);
      if (owner.name !== data.user.name) return;
      await this.chatDao.removeUserFromChannel(data.room, name);
      server
        .to(this.getUser(name).socket.id)
        .emit(
          'invite',
          await this.chatDao.getUserChannels(this.getUser(name).user.id),
        );
        server.to(data.room).emit(`${name}: got kicked`)
        this.chatDao.saveMessageToChannel({user: data.user, input: 'got kicked', room: data.room });
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  private gameInvite(data: IMessage, server: Server) {
    const name = data.input.substring(data.input.indexOf(' ') + 1);
    const opponent = this.getUserInChannel(name, data.room);
    if (opponent) {
      server
        .to(opponent.socket.id)
        .emit(
          'message',
          `${data.user.name} wants to play with you [type \'yes\' to accept]`,
        );
      this.opponents.set(name, data.user.name);
    }
  }

  private async gameAccept(
    data: IMessage,
    server: Server,
    gameServ: GamesService,
  ) {
    const user: IGameUser = this.getUserInChannel(data.user.name, data.room);
    const opponent: IGameUser = this.getUserInChannel(
      this.opponents.get(data.user.name),
      data.room,
    );
    if (opponent && data.input === 'yes') {
      const gameid = await gameServ.startGameLoop(opponent, user, 1);
      server.to(user.socket.id).emit('game', { gameId: gameid, side: 'right' });
      server
        .to(opponent.socket.id)
        .emit('game', { gameId: gameid, side: 'left' });
    } else if (opponent) {
      user.socket
        .to(opponent.socket.id)
        .emit('message', `${user.user.name} declined`);
    }
    this.opponents.delete(data.user.name);
  }
}
