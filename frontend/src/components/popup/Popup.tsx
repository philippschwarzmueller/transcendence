import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
  ReactNode,
  useContext,
  useEffect,
} from "react";

import Input from "../input/Input";
import styled from "styled-components";
import { IUser } from "../../context/auth";
import { SocketContext } from "../../context/socket";
import Button from "../button/Button";
import Userbrowser from "../userbrowser/Userbrowser";
import { EChannelType, IChannel, ITab } from "../chatwindow/properties";

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

const StyledDiv = styled.div`
  text-align: center;
  min-width: 4rem;
  min-height: 1rem;
  display: flex;
  align-items: center;
  background-color: rgb(195, 199, 203);
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 1px 0px 1px;
  padding: 8px;
  cursor: pointer;
  &:active {
    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;
    box-shadow:
      inset 0 0 0 1px rgb(134, 138, 142),
      0 0 0 1px rgb(0, 0, 0);
  }
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
  const [channel, setChannel] = useState<IChannel[]>([]);
  const [channelType, setChanneltype] = useState<EChannelType>(
    EChannelType.PUBLIC,
  );
  let key = 0;

  useImperativeHandle(ref, () => ({
    openRoom,
  }));

  useEffect(() => {
    socket.emit("channel", user, (res: IChannel[]) => setChannel(res));
  }, []);

  function openRoom(event: React.MouseEvent) {
    event.preventDefault();
    setPositionX(event.pageX);
    setPositionY(event.pageY);
    setDisplay(!display);
  }

  function openChannel(data: IChannel) {
    socket.emit(
      "create",
      data,
      (res: ITab[]) => setTabs(res),
    );
    setDisplay(false);
    setInput("");
  }

  return (
    <>
      <Userbrowser
        $display={visable}
        ></Userbrowser>
      <InputField $display={display} $posX={positionX} $posY={positionY}>
        {children}
        {channel.map((ch) => {
          return (
            <StyledDiv key={key++} onClick={() => openChannel(ch)}>
              <p>
              {ch.type === EChannelType.PRIVATE && "private " }
              {ch.type === EChannelType.PUBLIC && "public " }
              {ch.title} </p>
            </StyledDiv>
          )
        })}
        <Input
          id="room"
          value={input}
          label="room"
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              openChannel({ user: user, type: channelType, id: 0, title: input });
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
