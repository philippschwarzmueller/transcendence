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
import { EChannelType, ITab } from "../chatwindow/properties";

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
  placeholder: string;
  children: ReactNode;
  user: IUser;
  setTabs: (s: ITab[]) => void;
}

interface refs {
  openRoom: (event: React.MouseEvent) => void;
}

function Popup(
  { placeholder, children, user, setTabs }: props,
  ref: Ref<refs>,
) {
  const socket = useContext(SocketContext);
  const [input, setInput] = useState<string>("");
  const [display, setDisplay] = useState<boolean>(false);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [visable, setVisable] = useState<boolean>(false);
  const [channelType, setChanneltype] = useState<EChannelType>(
    EChannelType.PUBLIC,
  );

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
          id="room"
          value={input}
          label="room"
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              socket.emit(
                "create",
                { user: user, type: channelType, id: 0, title: input },
                (res: ITab[]) => setTabs(res),
              );
              setDisplay(false);
              setInput("");
            }
          }}
        ></Input>
        <Button onClick={() => setVisable(!visable)}
          >User Chat</Button>
        <form>
          <label>
            <input
              type="radio"
              name="type"
              value="public"
              checked={channelType === EChannelType.PUBLIC}
              onChange={() => setChanneltype(EChannelType.PUBLIC)}
            ></input>
            Public
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="private"
              checked={channelType === EChannelType.PRIVATE}
              onChange={() => setChanneltype(EChannelType.PRIVATE)}
            ></input>
            Private
          </label>
        </form>
      </InputField>
    </>
  );
}

export default forwardRef(Popup);
