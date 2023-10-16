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

@WebSocketGateway(8080, {
  cors: {
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: message, @ConnectedSocket() client: Socket) {
    console.log(data);
    client.to(data.room).emit('message', `${data.user}: ${data.input}`);
  }

  @SubscribeMessage('join')
  joinRoom(@MessageBody() data: message, @ConnectedSocket() client: Socket) {
    this.server
      .to(data.room)
      .emit('message', `${data.user} joined ${data.room}`);
    client.join(data.room);
  }

  afterInit(server: any): any {
    console.log('init');
  }
}
