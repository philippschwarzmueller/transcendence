import { Socket, Server } from "socket.io"
import { IUser, message, userInfo} from "./properties"
import { IGameUser } from "../games/properties"
import { GamesService } from "../games/games.service"

const users: Map<string, userInfo> = new Map<string, userInfo>();

export function manageUsers(data: message, client: Socket) {
  if (users.has(data.user.name)) {
    users.get(data.user.name).user.socket = client;
  }
  else {
    users.set(data.user.name, {user:{ user: data.user, socket: client }, opponent: null});
  }
}

export function gameInvite(data: message, server: Server): boolean {
  let name: string = data.input.substring(6);
  if (data.input.substring(0, 5) !== '/pong' || users.get(name).opponent !== null) return false;
  server.to(users.get(name).user.socket.id).emit("message", `${data.user.name} wants to play with you [y/n]`);
  users.get(name).opponent = users.get(data.user.name).user;
  return true;
}

export function gameAccept(data: message, server: Server): boolean {
  let user: IGameUser = users.get(data.user.name).user;
  let opponent: IGameUser = users.get(data.user.name).opponent;
  if (opponent === null)
    return false;
  if (data.input !== "y") {
    server.to(opponent.socket.id).emit("message", `${data.user.name} declined`)
    users.get(data.user.name).opponent = null;
    return true;
  }
  server.to(opponent.socket.id).emit("message", `${data.user.name} accepted`)
  let gs: GamesService = new GamesService();
  let gameid = gs.startGameLoop(opponent, user);
  server.to(user.socket.id).emit("game", { gameid: gameid, side: "right" });
  server.to(opponent.socket.id).emit("game", { gameid: gameid, side: "left" });
  users.get(data.user.name).opponent = null;
  return true;
}
