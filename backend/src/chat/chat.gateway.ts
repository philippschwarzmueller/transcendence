interface payload {
  user: string;
  content: string;
  room: string;
}

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

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
  handleEvent(@MessageBody() data: payload) {
    const mess = `${data.user}: ${data.content}`;
    this.server.to(data.room).emit('message', mess);
    messages.get(data.room).push(mess);
  }

  @SubscribeMessage('pong')
  challenge(@MessageBody() data: payload) {
    const challenged = data.content.substring(6);
    const invitation = `${data.user} wants to play [Y/N]:`;
    this.server
      .to(data.room)
      .emit('pong', { user: challenged, content: invitation, room: data.user });
  }

  @SubscribeMessage('pong accept')
  play(@MessageBody() data: payload) {
    if (data.content === 'Yes')
      console.log(`${data.user} wants to play ${data.room}`);
    else console.log(`${data.user} refused to play ${data.room}`);
  }

  @SubscribeMessage('join')
  joinRoom(@MessageBody() data: payload, @ConnectedSocket() client: Socket) {
    const mess = `${data.user} joined ${data.room}`;
    client.join(data.room);
    if (!messages.has(data.room)) {
      messages.set(data.room, []);
      rooms.push(data.room);
    }
    this.server.emit('room update', rooms);
    client.to(data.room).emit('message', mess);
    messages.get(data.room).push(mess);
    return messages.get(data.room);
  }

  afterInit(server: any): any {}

  //following function are purely dev functions
  @SubscribeMessage('clear')
  clearRoom(@MessageBody() room: string) {
    messages.get(room).splice(0, messages.get(room).length);
    return messages.get(room);
  }

  @SubscribeMessage('remove')
  removeRoom(@MessageBody() room: string) {
    messages.delete(room);
    rooms.splice(rooms.indexOf(room), 1);
    this.server.emit('room update', rooms);
    console.log(rooms);
  }
}
