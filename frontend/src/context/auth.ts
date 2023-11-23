import { createContext } from "react";

export interface IUser {
  id?: number | undefined;
  name: string | undefined;
  intraname: string | undefined;
  twoFAenabled: boolean;
  profilePictureUrl: string | undefined;
  token?: string | undefined;
  activeChats: string[];
}

let default_user: IUser = {
  id: undefined,
  name: undefined,
  intraname: undefined,
  twoFAenabled: false,
  profilePictureUrl: undefined,
  token: undefined,
  activeChats: [],
};

export interface IAuthContext {
  user: IUser;
  logIn: (user: IUser) => void;
  logOut: () => void;
}

export const AuthContext: React.Context<IAuthContext> =
  createContext<IAuthContext>({
    user: default_user,
    logIn: (user: IUser) => {},
    logOut: () => {},
  });
