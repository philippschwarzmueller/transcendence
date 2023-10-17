import { Socket } from 'socket.io';

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
}

export interface IGame {
  gameId: string;
  ball: IBall;
  left: IPaddle;
  right: IPaddle;
  pointsLeft: number;
  pointsRight: number;
  keyStateLeft: IKeyState;
  keyStateRight: IKeyState;
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
}

export interface IGameSocketPayload {
  side: string;
  gameId: string;
  keystate: IKeyState;
  user: IGameUser;
}

export interface IGameStart {
  gameId: number;
  side: string;
}

export interface IGameUser {
  userId: string;
  socket: Socket;
}

export interface IGameBackend {
  gameId: string;
  leftPlayer: IGameUser;
  rightPlayer: IGameUser;
  game: IGame;
  spectatorSockets: Socket[];
  interval?: NodeJS.Timeout;
}

const properties: IProperties = {
  window: { width: 960, height: 640, color: 'black' },
  paddle: { width: 2, height: 15, speed: 200, color: 'white' },
  ballProperties: { radius: 10, color: 'white', acceleration: 1.1 },
  framerate: 25,
};

export const ballSpawn: IBall = {
  x: properties.window.width / 2,
  y: properties.window.height / 2,
  speed_x: 5,
  speed_y: 0,
};

export const maxScore: number = 2;

export const gameSpawn: IGame = {
  gameId: '0',
  ball: ballSpawn,
  left: {
    height: 320,
    side: 'left',
  },
  right: {
    height: 320,
    side: 'right',
  },
  pointsLeft: 0,
  pointsRight: 0,
  keyStateLeft: { up: false, down: false },
  keyStateRight: { up: false, down: false },
};

export default properties;
