interface message {
  user: string;
  input: string;
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
  handleEvent(@MessageBody() data: message) {
    const mess = `${data.user}: ${data.input}`;
    this.server.to(data.room).emit('message', mess);
    messages.get(data.room).push(mess);
  }

  @SubscribeMessage('join')
  joinRoom(@MessageBody() data: message, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    if (!messages.has(data.room)) {
      messages.set(data.room, []);
      rooms.push(data.room);
    }
    this.server.emit('room update', rooms);
    messages.get(data.room).push(`${data.user} joined ${data.room}`);
    return messages.get(data.room);
  }

  afterInit(server: any): any {
    console.log('init');
  }
}
