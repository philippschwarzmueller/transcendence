import { IKeyState } from "./properties";

export const setKeyEventListener = (
  keystateRef: React.MutableRefObject<IKeyState>
): void => {
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "ArrowUp") keystateRef.current.up = true;
      if (e.key === "ArrowDown") keystateRef.current.down = true;
      if (e.key === "ArrowLeft") keystateRef.current.left = true;
      if (e.key === "ArrowRight") keystateRef.current.right = true;
    },
    true
  );

  window.addEventListener(
    "keyup",
    (e) => {
      if (e.key === "ArrowUp") keystateRef.current.up = false;
      if (e.key === "ArrowDown") keystateRef.current.down = false;
      if (e.key === "ArrowLeft") keystateRef.current.left = false;
      if (e.key === "ArrowRight") keystateRef.current.right = false;
    },
    true
  );
};
