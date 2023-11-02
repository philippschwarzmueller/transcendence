import { createContext } from "react";
import { io, Socket } from "socket.io-client";

export const awSocket = io(`http://${window.location.hostname}:${8080}`);

export const SocketContext = createContext<Socket>(awSocket);
