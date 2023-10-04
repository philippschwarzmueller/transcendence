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

interface IProperties {
  window: IWindow;
  paddle: IPaddle;
  framerate: number; // frontend game framerate
}

const properties: IProperties = {
  window: { width: 960, height: 640, color: "black" },
  paddle: { width: 2, height: 15, speed: 200, color: "white" },
  framerate: 25,
};

export default properties;
