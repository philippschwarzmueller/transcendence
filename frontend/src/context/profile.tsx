import { createContext } from "react"

export interface IProfileContext {
    intraname: string;
    name: string;
    profilePictureUrl: string;
  }

export const ProfileContext = createContext<IProfileContext>({
    intraname: "",
    name: "",
    profilePictureUrl: "",
  })

