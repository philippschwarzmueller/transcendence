interface IWindow {
  width: number; // gamewindow width in px
  height: number; // gamewindow height in px
  color: string; //background color
}

interface IPaddle {
  width: number; //paddle width in % from gamewindow
  height: number; //paddle height in % from gamewindow
  speed: number; //speed of the paddle, not dependend on framerate, the higher the faster
  color: string; //paddle color
}

interface IBallProperties {
  radius: number; //radius of the painted ball
  color: string; // color of the painted ball
}

interface IProperties {
  window: IWindow;
  paddle: IPaddle;
  ballProperties: IBallProperties;
  framerate: number; // frontend game framerate
}

export interface IBall {
  x: number;
  y: number;
  speed_x: number;
  speed_y: number;
}

const properties: IProperties = {
  window: { width: 960, height: 640, color: "black" },
  paddle: { width: 2, height: 15, speed: 200, color: "white" },
  ballProperties: { radius: 10, color: "white" },
  framerate: 25,
};

export const ballSpawn: IBall = {
  x: properties.window.width / 2,
  y: properties.window.height / 2,
  speed_x: 5,
  speed_y: 5,
};
export default properties;
