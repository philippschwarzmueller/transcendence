import { Socket } from "socket.io"
import { IGame, IGameUser } from "src/games/properties";

export interface IUser {
  id: number | undefined;
  name: string | undefined;
  image: string | undefined;
  token: string | undefined;
}

export interface message {
  user: IUser;
  input: string;
  room: string;
}

export interface userInfo {
  user: IGameUser;
  opponent: IGameUser | null;
}
