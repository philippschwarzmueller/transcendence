import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { IMessage } from './properties';
import { ChatDAO } from './chat.dao';
import { Server } from 'socket.io';
import { IGameUser } from 'src/games/properties';
import { GamesService } from 'src/games/games.service';
import { ChatServiceBase } from './chat.servicebase';
import { User } from 'src/users/user.entity';

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
        this.promote(data, server);
        break;
      case '/demote':
        this.demote(data, server);
        break;
      case '/mute':
        this.mute(data, server);
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
      if (await this.chatDao.getMute(data.room, data.user.name))
        return;
      const blocking: User[] = await this.userService.getBlocking(data.user.name);
      const blockNames: string[] = blocking.map((u) => {
        return u.intraname;
      })
      server.to(data.room.toString()).emit('message', {message: mess, block: blockNames });
      await this.chatDao.saveMessageToChannel(data);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  private async addUser(data: IMessage, server: Server) {
    try {
      const name = data.input.substring(data.input.indexOf(' ') + 1);
      const owner = await this.chatDao.getChannelOwner(data.room);
      if (owner.name !== data.user.name 
        && (await this.chatDao.getAdmin(data.room, data.user.name)) === 0)
        return;
      await this.chatDao.addUserToChannel(data.room, name);
      server
        .to(this.getUser(name).socket.id)
        .emit(
          'invite',
          await this.chatDao.getRawUserChannels(this.getUser(name).user.id),
        );
      server.to(data.room.toString()).emit(`${name}: got added`);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  private async promote(data: IMessage, server: Server) {
    try {
      const name = data.input.substring(data.input.indexOf(' ') + 1);
      const owner = await this.chatDao.getChannelOwner(data.room);
      if (owner.name !== data.user.name 
        && (await this.chatDao.getAdmin(data.room, data.user.name)) === 0)
        return;
      await this.chatDao.promoteUser(data.room, name);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  private async demote(data: IMessage, server: Server) {
    try {
      const name = data.input.substring(data.input.indexOf(' ') + 1);
      const owner = await this.chatDao.getChannelOwner(data.room);
      if (owner.name !== data.user.name 
        && (await this.chatDao.getAdmin(data.room, data.user.name)) === 0)
        return;
      await this.chatDao.demoteUser(data.room, name);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  private async mute(data: IMessage, server: Server) {
    try {
      let time = 5;
      const val = data.input.split(' ');
      if (val.length === 3 && isNaN(Number(val[2])) !== true)
        time = Number(val[2]);
      const owner = await this.chatDao.getChannelOwner(data.room);
      if (owner.name !== data.user.name 
        && (await this.chatDao.getAdmin(data.room, data.user.name)) === 0
        && owner.name !== val[1])
        return;
      await this.chatDao.muteUser(data.room, val[1], time);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  private async kickUser(data: IMessage, server: Server) {
    try {
      const name = data.input.substring(data.input.indexOf(' ') + 1);
      const owner = await this.chatDao.getChannelOwner(data.room);
      if (owner.name !== data.user.name 
        && (await this.chatDao.getAdmin(data.room, data.user.name)) === 0
        && owner.name !== name)
        return;
      await this.chatDao.removeUserFromChannel(data.room, name);
      server
        .to(this.getUser(name).socket.id)
        .emit(
          'invite',
          await this.chatDao.getRawUserChannels(this.getUser(name).user.id),
        );
      server.to(data.room.toString()).emit(`${name}: got kicked`);
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
