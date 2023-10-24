import { Socket, Server } from "socket.io"
import { IUser, message, userInfo} from "./properties"
import { IGameUser } from "../games/properties"
import { GamesService } from "../games/games.service"

const users: Map<string, userInfo> = new Map<string, userInfo>();

export function manageUsers(data: message, client: Socket) {
  if (users.has(data.user.name)) {
    users.get(data.user.name).socket = client;
    users.get(data.user.name).room = data.room;
  }
  else {
    users.set(data.user.name, {socket: client, room: data.room, id: data.user.id, invited: null});
  }
}

export function gameInvite(data: message, server: Server): boolean {
  let user: string = data.input.substring(6);
  if (data.input.substring(0, 5) !== '/pong' || users.get(user).invited !== null) return false;
  server.to(users.get(user).socket.id).emit("message", `${data.user.name} wants to play with you [y/n]`);
  users.get(user).invited = users.get(data.user.name).socket;
  console.log(users.get(user).invited);
  return true;
}

export function gameAccept(data: message, server: Server): boolean {
  let opponent = users.get(data.user.name).invited;
  if (opponent === null)
    return false;
  if (data.input !== "y") {
    server.to(opponent.id).emit("message", `${data.user.name} declined`)
    users.get(data.user.name).invited = null;
    return true;
  }
  server.to(opponent.id).emit("message", `${data.user.name} accepted`)
  users.get(data.user.name).invited = null;
  server.to(users.get(data.user.name).socket.id).emit("game");

  return true;
}
