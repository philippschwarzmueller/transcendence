import { Socket } from "socket.io-client";
import { IMessage } from "./properties";

export const invite = (payload: IMessage, socket: Socket): boolean => {
  if (payload.content?.substring(0, 5).localeCompare("/pong")) return false;
  socket.emit("pong", payload);
  return true;
};
