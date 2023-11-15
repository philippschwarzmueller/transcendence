import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
  ReactNode,
  useContext,
} from "react";
import Input from "../input/Input";
import styled from "styled-components";
import { IUser } from "../../context/auth";
import { SocketContext } from "../../context/socket";
import Button from "../button/Button";
import Userbrowser from "../userbrowser/Userbrowser";

const InputField = styled.div<{
  $display: boolean;
  $posX: number;
  $posY: number;
}>`
  display: ${(props) => (props.$display ? "" : "none")};
  position: absolute;
  z-index: 100;
  left: ${(props) => props.$posX + "px"};
  top: ${(props) => props.$posY + "px"};
  background-color: rgb(195, 199, 203);
  min-width: 100px;
  margin-block-start: 0px;
  margin-inline-start: 0px;
  padding-inline-start: 0px;
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 1px 0px 1px;
`;

interface props {
  onKey: (s: string) => void;
  placeholder: string;
  children: ReactNode;
  user: IUser;
  setTabs: (s: string[]) => void;
}

interface refs {
  openRoom: (event: React.MouseEvent) => void;
}

function Popup(
  { onKey, placeholder, children, user, setTabs }: props,
  ref: Ref<refs>,
) {
  const socket = useContext(SocketContext);
  const [input, setInput] = useState<string>("");
  const [display, setDisplay] = useState<boolean>(false);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [visable, setVisable] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    openRoom,
  }));

  function openRoom(event: React.MouseEvent) {
    event.preventDefault();
    setPositionX(event.pageX);
    setPositionY(event.pageY);
    setDisplay(!display);
  }

  return (
    <>
      <Userbrowser
        $display={visable}
        ></Userbrowser>
      <InputField $display={display} $posX={positionX} $posY={positionY}>
        {children}
        <Input
          id='room'
          value={input}
          label="room"
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              socket.emit("create", { user: user, input: input, room: input }, (res: string[]) =>
                setTabs(res)
              );
              onKey(input);
              setDisplay(false);
              setInput("");
            }
          }}
        ></Input>
        <Button onClick={() => setVisable(!visable)}
          >User Chat</Button>
      </InputField>
    </>
  );
}

export default forwardRef(Popup);
