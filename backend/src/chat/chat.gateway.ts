interface message {
  user: string;
  input: string;
  room: string;
}

interface userInfo {
  socket: Socket;
  room: string;
  invited: Socket;
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
const users: Map<string, userInfo> = new Map<string, userInfo>();
const messages: Map<string, string[]> = new Map<string, string[]>();

function manageUsers(data: message, client: Socket) {
  if (users.has(data.user)) {
    users.get(data.user).socket = client;
    users.get(data.user).room = data.room;
  }
  else {
    users.set(data.user, {socket: client, room: data.room, invited: null});
  }
}

function gameInvite(data: message, server: Server): boolean {
  let user: string = data.input.substring(6);
  if (data.input.substring(0, 5) !== '/pong' || users.get(user).invited !== null) return false;
  server.to(users.get(user).socket.id).emit("message", `${data.user} wants to play with you [y/n]`);
  users.get(user).invited = users.get(data.user).socket;
  console.log(users.get(user).invited);
  return true;
}

function gameAccept(data: message, server: Server): boolean {
  let opponent = users.get(data.user).invited;
  if (opponent === null)
    return false;
  if (data.input !== "y") {
    server.to(opponent.id).emit("message", `${data.user} declined`)
    users.get(data.user).invited = null;
    return true;
  }
  server.to(opponent.id).emit("message", `${data.user} accepted`)
  users.get(data.user).invited = null;
  return true;
}

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
    manageUsers(data, client);
    const mess = `${data.user}: ${data.input}`;
    if (!gameInvite(data, this.server) && !gameAccept(data, this.server)){
      this.server.to(data.room).emit('message', mess);
      messages.get(data.room).push(mess);
    }
  }

  @SubscribeMessage('join')
  joinRoom(@MessageBody() data: message, @ConnectedSocket() client: Socket) {
    const mess = `${data.user} joined ${data.room}`;
    manageUsers(data, client);
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
