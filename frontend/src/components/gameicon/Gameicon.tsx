import { useState } from "react";
import { styled } from "styled-components";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import Queuebox from "../queuebox/Queuebox";

const Icon = styled.div<{ $active: boolean }>`
  user-select: none;
  width: 64px;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  color: white;
  outline-offset: -4px;
  background-color: ${(props) => (props.$active ? "rgb(0, 14, 122)" : "")};
  outline: ${(props) => (props.$active ? "white dotted 1px" : "")};
  cursor: pointer;
`;

const Gameicon: React.FC = () => {
  const [displayQueue, setDisplayQueue] = useState<boolean>(false);

  return (
    <>
      <Icon
        onClick={() => setDisplayQueue(!displayQueue)}
        $active={displayQueue}
      >
        <img src={require("../../images/pong.png")} alt="pong" height="64px" />
        Pong
      </Icon>
      <Moveablewindow
        title="Queue"
        positionX={100}
        positionY={100}
        positionZ={100}
        display={displayQueue}
        setDisplay={setDisplayQueue}
      >
        <Queuebox />
      </Moveablewindow>
    </>
  );
};

export default Gameicon;
