import React, { useState, useEffect } from "react";
import styled from "styled-components";
import icon from "../../images/questionbook.png";
import { ButtonWrapper } from "../homebutton/homebutton";

export interface HoverHelpProps {
  children?: React.ReactNode;
}

const PopupWrapper = styled.div<{ position: { top: number; left: number } }>`
  padding-left: 10px;
  padding-right: 10px;
  position: absolute;
  background-color: rgb(195, 199, 203);
  top: ${(props) => props.position.top + 10}px;
  left: ${(props) => props.position.left + 10}px;
  z-index: 100;
  border-top: 1px solid white;
  border-left: 1px solid white;
  border-bottom: 1px solid black;
  border-right: 1px solid black;
  box-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
`;

const Popup: React.FC = () => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = (event: MouseEvent) => {
      setPosition({ top: event.clientY, left: event.clientX });
    };

    window.addEventListener("mousemove", updatePosition);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
    };
  }, []);

  return (
    <>
      {position.top && position.left ? (
        <PopupWrapper position={position}>
          <p>Esc: back to homescreen</p>
          <p>Arrow Keys: move paddle</p>
        </PopupWrapper>
      ) : null}
    </>
  );
};

const HoverHelp: React.FC<HoverHelpProps> = (props: HoverHelpProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <>
      {isHovered ? <Popup /> : null}
      <ButtonWrapper
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <img src={icon} alt="icon" />
      </ButtonWrapper>
    </>
  );
};

export default HoverHelp;
