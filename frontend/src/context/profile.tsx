import { createContext } from "react"

export interface IProfileContext {
    intraname: string;
    name: string;
    profilePictureUrl: string;
    display: boolean;
  }

export const ProfileContext = createContext<IProfileContext>({
    intraname: "",
    name: "",
    display: false,
    profilePictureUrl: "",
  })

