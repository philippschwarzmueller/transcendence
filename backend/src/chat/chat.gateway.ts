import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { IMessage } from './properties';
import { manageUsers, gameInvite, gameAccept } from './chat.gameinvite';
import { Socket, Server } from 'socket.io';

const rooms: string[] = [];
const messages: Map<string, string[]> = new Map<string, string[]>();

@WebSocketGateway(8080, {
  cors: {
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  async handleEvent(
    @MessageBody() data: IMessage,
    @ConnectedSocket() client: Socket,
  ) {
    manageUsers(data, client);
    const mess = `${data.user.name}: ${data.input}`;
    if (!gameInvite(data, this.server) && !gameAccept(data, this.server)) {
      this.server.to(data.room).emit('message', mess);
      messages.get(data.room).push(mess);
    }
  }

  @SubscribeMessage('join')
  joinRoom(@MessageBody() data: IMessage, @ConnectedSocket() client: Socket) {
    const mess = `${data.user.name} joined ${data.room}`;
    manageUsers(data, client);
    client.join(data.room);
    if (!messages.has(data.room)) {
      messages.set(data.room, []);
      rooms.push(data.room);
    }
    client.to(data.room).emit('message', mess);
    messages.get(data.room).push(mess);
    return messages.get(data.room);
  }

  afterInit(server: any): any {}

  //following function are purely dev functions
  @SubscribeMessage('clear')
  clearRoom(@MessageBody() reciever: string) {
    messages.get(reciever).splice(0, messages.get(reciever).length);
    return messages.get(reciever);
  }

  @SubscribeMessage('remove')
  removeRoom(@MessageBody() reciever: string) {
    messages.delete(reciever);
    rooms.splice(rooms.indexOf(reciever), 1);
    this.server.emit('reciever update', rooms);
    console.log(rooms);
  }
}
