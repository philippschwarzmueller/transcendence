import { Socket, Server } from 'socket.io';
import { IMessage, userInfo } from './properties';
import { IGameUser } from '../games/properties';
import { GamesService } from '../games/games.service';
import { ChatDAO } from './chat.dao';

const opponents: Map<string, string> = new Map<string, string>();

function getUser(
  channels: Map<string, IGameUser[]>,
  name: string,
  room: string,
): IGameUser {
  return channels.get(room).find((user) => user.user.name === name);
}

export async function printVanillaMessage(
  data: IMessage,
  server: Server,
  dao: ChatDAO,
) {
  let chatDao: ChatDAO;
  try {
    const mess = `${data.user.name}: ${data.input}`;
    server.to(data.room).emit('message', mess);
    await dao.saveMessageToChannel(data);
  } catch (error) {
    console.log(error);
  }
}

export function gameInvite(
  data: IMessage,
  server: Server,
  channels: Map<string, IGameUser[]>,
) {
  const name = data.input.substring(data.input.indexOf(' '));
  const opponent = getUser(channels, data.user.name, data.room);
  if (opponent) {
    server
      .to(opponent.socket.id)
      .emit('message', `${data.user.name} wants to play with you [y/n]`);
    opponents.set(name, data.user.name);
  }
}

export function gameAccept(data: IMessage, channels: Map<string, IGameUser[]>) {
  const user = getUser(channels, data.user.name, data.room);
  const opponent = opponents.get(data.user.name);
  if (opponent) {
    user.socket
      .to(getUser(channels, opponent, data.room).socket.id)
      .emit('message', 'accpected');
  }
}
