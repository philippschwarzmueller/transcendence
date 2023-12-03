import { Gamesocket } from "./socket";
import { IUser } from "../../context/auth";

interface IWindow {
  width: number; // gamewindow width in px
  height: number; // gamewindow height in px
  color: string; //background color
}

interface IPaddleProperties {
  width: number; //paddle width in % from gamewindow
  height: number; //paddle height in % from gamewindow
  speed: number; //speed of the paddle, not dependend on framerate, the higher the faster
  color: string; //paddle color
}

interface IBallProperties {
  radius: number; //radius of the painted ball
  color: string; // color of the painted ball
  acceleration: number;
  maxBounceAngle: number;
  maxSpeed: number;
}

interface IProperties {
  window: IWindow;
  paddle: IPaddleProperties;
  ballProperties: IBallProperties;
  framerate: number; // frontend game framerate
}

export interface IPaddle {
  height: number;
  side: string;
  lateral: number;
}

export interface IGame {
  gameId: string;
  ball: IBall;
  leftPaddle: IPaddle;
  rightPaddle: IPaddle;
  pointsLeft: number;
  pointsRight: number;
  keyStateLeft: IKeyState;
  keyStateRight: IKeyState;
  winner?: IUser;
  looser?: IUser;
  isFinished: boolean;
}

export interface IBall {
  x: number;
  y: number;
  speed_x: number;
  speed_y: number;
}

export interface IKeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface IGameSocketPayload {
  side: string;
  gameId: string;
  keystate: IKeyState;
  user: IAnonymUser;
}

export interface IGameStart {
  gameId: number;
  side: string;
}

export interface IGameUser {
  user: IUser;
  socket: Gamesocket;
}

export interface IGameBackend {
  gameId: string;
  leftPlayer: IGameUser;
  rightPlayer: IGameUser;
  gameState: IGame;
  spectatorSockets: Gamesocket[];
  interval?: NodeJS.Timeout;
  gamemode: EGamemode;
}

export interface IFinishedGame {
  gameExists: boolean;
  winner?: string;
  looser?: string;
  winnerPoints?: number;
  looserPoints?: number;
}

export const WINDOW_WIDTH: number = 960;
export const WINDOW_HEIGHT: number = 640;

const properties: IProperties = {
  window: { width: WINDOW_WIDTH, height: WINDOW_HEIGHT, color: "black" },
  paddle: {
    width: (WINDOW_WIDTH * 2) / 100,
    height: (WINDOW_HEIGHT * 15) / 100,
    speed: 200,
    color: "white",
  },
  ballProperties: {
    radius: 15,
    color: "white",
    acceleration: 1.1,
    maxBounceAngle: 20,
    maxSpeed: 30,
  },
  framerate: 25,
};

export const ballSpawn: IBall = {
  x: properties.window.width / 2,
  y: properties.window.height / 2,
  speed_x: 5,
  speed_y: 0,
};

export const maxScore: number = 2;

export enum EGamemode {
  standard = 1,
  roomMovement = 2,
}

export interface IQueuePayload {
  user: IUser;
  gamemode: EGamemode;
}

export const gameSpawn: IGame = {
  gameId: "0",
  ball: ballSpawn,
  leftPaddle: {
    height: properties.window.height / 2,
    side: "left",
    lateral: properties.paddle.width / 2,
  },
  rightPaddle: {
    height: properties.window.height / 2,
    side: "right",
    lateral: properties.window.width - properties.paddle.width / 2,
  },
  pointsLeft: 0,
  pointsRight: 0,
  keyStateLeft: { up: false, down: false, left: false, right: false },
  keyStateRight: { up: false, down: false, left: false, right: false },
  isFinished: false,
};

export interface IAnonymUser {
  intraname: string | null;
  nickname: string | null;
  hashedToken: string | null;
}

export const goalSizePercent: number = 50;

export const queueTimeout: number = 7;

export default properties;
