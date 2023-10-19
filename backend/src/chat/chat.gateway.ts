interface message {
  user: string;
  input: string;
  reciever: string;
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
    this.server.to(data.reciever).emit('message', mess);
    messages.get(data.reciever).push(mess);
  }

  @SubscribeMessage('join')
  joinRoom(@MessageBody() data: message, @ConnectedSocket() client: Socket) {
    const mess = `${data.user} joined ${data.reciever}`;
    client.join(data.reciever);
    if (!messages.has(data.reciever)) {
      messages.set(data.reciever, []);
      rooms.push(data.reciever);
    }
    this.server.emit('reciever update', rooms);
    client.to(data.reciever).emit('message', mess);
    messages.get(data.reciever).push(mess);
    return messages.get(data.reciever);
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
