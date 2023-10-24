import { Socket } from "socket.io"

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
  socket: Socket;
  room: string;
  id: number | undefined;
  invited: Socket;
}
