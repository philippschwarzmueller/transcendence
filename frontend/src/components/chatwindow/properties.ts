import { IUser } from "../../context/auth";

export enum EChannelType {
  PRIVATE,
  PUBLIC,
  CHAT,
}

export interface IChannel {
  user: IUser;
  type: EChannelType;
  id: number;
  title: string | undefined,
}

export interface ITab {
  id: number;
  title: string;
}

export interface IMessage {
  message: string;
  block: string[];
}