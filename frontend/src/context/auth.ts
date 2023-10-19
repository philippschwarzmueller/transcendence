import { createContext } from "react";

export interface IUser {
  id?: number | undefined;
  name: string | undefined;
  image: string | undefined;
  token?: string | undefined;
}

let default_user: IUser = {
  id: undefined,
  name: undefined,
  image: undefined,
  token: undefined,
};

export const AuthContext = createContext({
  user: default_user,
  logIn: (user: IUser) => {},
  logOut: () => {},
});
