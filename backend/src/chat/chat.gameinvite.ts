import { Socket, Server } from 'socket.io';
import { IMessage, userInfo } from './properties';
import { IGameUser } from '../games/properties';
import { GamesService } from '../games/games.service';

const users: Map<string, userInfo> = new Map<string, userInfo>();

export function manageUsers(data: IMessage, client: Socket) {
  if (users.has(data.user.name)) {
    users.get(data.user.name).user.socket = client;
  } else {
    users.set(data.user.name, {
      user: { user: data.user, socket: client },
      opponent: null,
    });
  }
}

export function gameInvite(data: IMessage, server: Server): boolean {
  const name: string = data.input.substring(6);
  if (
    data.input.substring(0, 5) !== '/pong' ||
    users.get(name).opponent !== null
  )
    return false;
  server
    .to(users.get(name).user.socket.id)
    .emit('message', `${data.user.name} wants to play with you [y/n]`);
  users.get(name).opponent = users.get(data.user.name).user;
  return true;
}

async function startGame(user: IGameUser, opponent: IGameUser, server: Server) {
  const gs: GamesService = new GamesService(null); // null is not correct but placeholder
  const gameid: string = await gs.startGameLoop(opponent, user);
  server.to(user.socket.id).emit('game', { gameId: gameid, side: 'right' });
  server.to(opponent.socket.id).emit('game', { gameId: gameid, side: 'left' });
}

export function gameAccept(data: IMessage, server: Server): boolean {
  const user: IGameUser = users.get(data.user.name).user;
  const opponent: IGameUser = users.get(data.user.name).opponent;
  if (opponent === null) return false;
  if (data.input !== 'y') {
    server.to(opponent.socket.id).emit('message', `${data.user.name} declined`);
    users.get(data.user.name).opponent = null;
    return true;
  }
  server.to(opponent.socket.id).emit('message', `${data.user.name} accepted`);
  startGame(user, opponent, server);
  users.get(data.user.name).opponent = null;
  return true;
}
