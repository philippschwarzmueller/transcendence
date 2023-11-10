import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { IMessage } from './properties';
import { ChatDAO } from './chat.dao';
import { Socket, Server } from 'socket.io';
import { IGameUser } from 'src/games/properties';
import { GamesService } from 'src/games/games.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(UsersService)
    private userService: UsersService,
    @Inject(ChatDAO)
    private chatDao: ChatDAO,
  ) {
    this.initializeMap();
  }

  activeClients: Map<string, IGameUser[]> = new Map<string, IGameUser[]>();
  opponents: Map<string, string> = new Map<string, string>();

  async initializeMap(): Promise<void> {
    const list = await this.chatDao.getAllChannels();
    list.forEach((item) => {
      this.activeClients.set(item, []);
    });
  }

  private updateActiveClients(data: IMessage, client: Socket) {
    for (const [key, value] of this.activeClients) {
      const tmp = value.filter((c) => c.user.name !== data.user.name);
      this.activeClients.set(key, tmp);
    }
    if (!this.activeClients.has(data.room))
      this.activeClients.set(data.room, []);
    this.activeClients.get(data.room).push({ user: data.user, socket: client });
  }

  private getUser(name: string, room: string): IGameUser {
    return this.activeClients.get(room).find((user) => user.user.name === name);
  }

  async getChats(userId: string): Promise<string[]> {
    let res: string[] = [];
    try {
      const user = await this.userService.findOneByName(userId);
      res = await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async addChat(
    userId: string,
    chatName: string,
    client: Socket,
  ): Promise<string[]> {
    const res: string[] = [];
    try {
      const user = await this.userService.findOneByName(userId);
      const rec = await this.userService.findOneByName(chatName).catch(error => console.log(error));
      await this.chatDao.saveChannel(chatName, userId);
      if (rec != undefined)
        await this.chatDao.addUserToChannel(chatName, chatName);
      client.join(chatName);
      return await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async removeChat(userId: string, chat: string): Promise<void> {
    try {
      const user = await this.userService.findOneByName(userId);
      await this.chatDao.removeUserFromChannel(chat, user);
    } catch (error) {
      console.log(error);
    }
  }

  async joinRoom(data: IMessage, client: Socket): Promise<string[]> {
    let res: string[] = [];
    try {
      const channel = await this.chatDao.getChannelByTitle(data.room);
      client.join(data.room);
      this.updateActiveClients(data, client);
      await this.chatDao.addUserToChannel(data.room, data.user.name);
      await this.chatDao.saveMessageToChannel({
        user: data.user,
        input: 'joined room',
        room: data.room,
      });
      client.to(data.room).emit('message', `${data.user.name}: joined room`);
      res = await this.chatDao.getRawChannelMessages(channel.id);
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async handleMessage(data: IMessage, server: Server, gameServ: GamesService) {
    let check = data.input;
    if (data.input.indexOf(' ') != -1)
      check = data.input.substring(0, data.input.indexOf(' '));
    switch (check) {
      case '/invite':
        break;
      case '/kick':
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
      console.log(error);
    }
  }

  private gameInvite(data: IMessage, server: Server) {
    const name = data.input.substring(data.input.indexOf(' ') + 1);
    const opponent = this.getUser(name, data.room);
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
    const user: IGameUser = this.getUser(data.user.name, data.room);
    const opponent: IGameUser = this.getUser(
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
