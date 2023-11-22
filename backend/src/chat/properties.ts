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
  id: number;
}

export enum EChannelType {
  PRIVATE,
  PUBLIC,
  CHAT,
}

export interface IChannel {
  user: IUser;
  type: EChannelType;
  id: number;
  title: string;
}

export interface ITab {
  type: EChannelType;
  id: number;
  title: string;
}
