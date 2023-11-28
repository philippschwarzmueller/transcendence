import { ReactNode, useState } from "react";
import styled from "styled-components";

const StyledWindow = styled.div<{ $display: boolean; $posZ: number }>`
  position: absolute;
  z-index: ${(props) => props.$posZ};
  display: ${(props) => (props.$display ? "" : "none")};
  padding: 5px;
  background-color: rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);
`;

const Windowbar = styled.div`
  height: 18px;
  margin-bottom: 2px;
  padding: 2px;
  display: flex;
  gap: 10px;
  box-shadow: none;
  background: rgb(0, 14, 122);
  color: White;
  font-size: 1em;
  cursor: grab;
`;

interface IMoveableWindow {
  title: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  display: boolean;
  children: ReactNode;
}

const Moveablewindow: React.FC<IMoveableWindow> = ({
  title,
  positionX,
  positionY,
  positionZ,
  display,
  children,
}) => {
  const [position, setPosition] = useState({
    x: positionX ? positionX : 200,
    y: positionY ? positionY : 100,
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const startDrag = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.clientX >= 0 && event.clientY >= 0) {
      setOffset({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    }
  };

  const handleDrag = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.clientX >= 0 && event.clientY >= 0) {
      setPosition({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      });
    } else {
      setPosition({
        x: position.x + offset.x,
        y: position.y + offset.y,
      });
    }
  };

  const handleDrop = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
  };

  const endDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.clientX >= 0 && event.clientY >= 0) {
      setPosition({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      });
      setOffset({
        x: 0,
        y: 0,
      });
    } else {
      setPosition({
        x: position.x + offset.x,
        y: position.y + offset.y,
      });
    }
  };

  return (
    <>
      <StyledWindow
        $posZ={positionZ ? positionZ : 0}
        $display={display}
        style={{ top: position.y, left: position.x }}
      >
        <Windowbar
          draggable={true}
          onDragStart={startDrag}
          onDrag={handleDrag}
          onDragEnd={endDrag}
          onDragOver={handleDrop}
        >
          <img
            width="16"
            height="16"
            src={require("../../images/monitor.png")}
            alt="Monitor"
          ></img>
          {title}
        </Windowbar>
        {children}
      </StyledWindow>
    </>
  );
};
export default Moveablewindow;
