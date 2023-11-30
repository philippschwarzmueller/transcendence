import { IUser } from "../../context/auth";

export enum EChannelType {
  PRIVATE,
  PUBLIC,
}

export interface IChannel {
  user: IUser;
  type: EChannelType;
  title: string;
}

export interface IMessage {
  message: string;
  block: string[];
}