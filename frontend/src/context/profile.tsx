import { createContext } from "react";
import { IUser } from "./auth";

export interface IProfile {
  intraname: string | undefined;
  name: string | undefined;
  profilePictureUrl: string | undefined;
  display: boolean;
}

let default_profile: IProfile = {
  intraname: "",
  name: "",
  profilePictureUrl: "",
  display: false,
};

export interface IProfileContext {
  profile: IProfile;
  updateProfile: (user: IUser, value: boolean) => void;
};

export const ProfileContext = createContext<IProfileContext>({
  profile: default_profile,
  updateProfile: () => {},
});
