import { IGameUser } from 'src/games/properties';

export interface IUser {
  id: number | undefined;
  name: string | undefined;
  image: string | undefined;
  token: string | undefined;
}

export interface IMessage {
  user: IUser;
  input: string;
  room: string;
}

export enum EChannelType {
  PRIVATE,
  PUBLIC
}

export interface IChannel {
  user: IUser;
  type: EChannelType;
  title: string;
}

export interface DMessage {
  content: string;
  sender: number;
}

export interface ISendMessage {
  message: string;
  block: string[];
}
