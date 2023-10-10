interface message {
  user: string;
  input: string;
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
    // origin: [0],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: message, @ConnectedSocket() client: Socket) {
    console.log(data);
    this.server.emit('message', `${data.user}: ${data.input}`);
  }

  afterInit(server: any): any {
    console.log('init');
  }
}
