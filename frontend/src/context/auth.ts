import { createContext } from "react";

export interface IUser {
  id?: number | undefined;
  name: string | undefined;
  image: string | undefined;
  token?: string | undefined;
  activeChats: string[];
}

let default_user: IUser = {
  id: undefined,
  name: undefined,
  image: undefined,
  token: undefined,
  activeChats: [],
};

interface IAuthContext {
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
