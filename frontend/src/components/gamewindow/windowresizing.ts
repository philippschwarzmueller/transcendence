import properties from "./properties";

export const getWindowDimensions = (): [number, number] => {
  const { innerWidth: width, innerHeight: height } = window;
  return [width, height];
};

export const calculateWindowproperties = (windowDimensions: any): void => {
  const sizeInPercent: number = 80;
  const widthByWidth: number = windowDimensions[0];
  const widthByHeight: number = (windowDimensions[1] * 3) / 2;
  const heightByWidth: number = windowDimensions[0] / 1.5;
  const heightByHeight: number = windowDimensions[1];
  properties.window.width =
    (Math.min(widthByWidth, widthByHeight) * sizeInPercent) / 100;
  properties.window.height =
    (Math.min(heightByWidth, heightByHeight) * sizeInPercent) / 100;
};
