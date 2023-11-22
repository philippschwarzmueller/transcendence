import { IUser } from "../../context/auth";

export enum EChannelType {
  PRIVATE,
  PUBLIC,
}

export interface IChannel {
  user: IUser;
  id: number;
}

export interface ITab {
  id: number;
  title: string;
}
