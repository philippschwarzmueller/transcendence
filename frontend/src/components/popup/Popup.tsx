import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
  useContext,
  useEffect,
} from "react";

import Input from "../input/Input";
import styled from "styled-components";
import { IUser } from "../../context/auth";
import { SocketContext } from "../../context/socket";
import { EChannelType, IChannel, ITab } from "../chatwindow/properties";
import WindowWrapper from "../outlinecontainer/outlinecontainer";

const InputField = styled.div<{
  $display: boolean;
  $posX: number;
  $posY: number;
}>`
  user-select: none;
  display: ${(props) => (props.$display ? "flex" : "none")};
  flex-direction: column;
  justify-content: center;
  position: absolute;
  padding: 15px;
  z-index: 300;
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

const StyledUl = styled.ul`
  padding: 4px;
  list-style: none;
  max-height: 200px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 17x;
    height: 17px;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    box-sizing: border-box;
    display: inline-block;
    background: rgb(195, 199, 203);
    color: rgb(0, 0, 0);
    border: 0px;
    box-shadow:
      rgb(0, 0, 0) -1px -1px 0px 0px inset,
      rgb(210, 210, 210) 1px 1px 0px 0px inset,
      rgb(134, 138, 142) -2px -2px 0px 0px inset,
      rgb(255, 255, 255) 2px 2px 0px 0px inset;
  }
`;

const StyledLi = styled.li`
  text-align: center;
  background-color: rgb(195, 199, 203);
  cursor: pointer;
  &:hover {
    background-color: rgb(0, 14, 122);
    color: white;
  }
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
  user: IUser;
  setTabs: (s: ITab[]) => void;
}

interface refs {
  openRoom: (event: React.MouseEvent) => void;
}

function Popup({ placeholder, user, setTabs }: props, ref: Ref<refs>) {
  const socket = useContext(SocketContext);
  const [input, setInput] = useState<string>("");
  const [display, setDisplay] = useState<boolean>(false);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
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
  }, [display]); // eslint-disable-line react-hooks/exhaustive-deps

  function openRoom(event: React.MouseEvent) {
    event.preventDefault();
    setPositionX(event.pageX);
    setPositionY(event.pageY);
    setDisplay(!display);
  }

  function openChannel(data: IChannel) {
    socket.emit("create", data, (res: ITab[]) => setTabs(res));
    setDisplay(false);
    setInput("");
  }

  return (
    <>
      <InputField
        onMouseLeave={() => setDisplay(!display)}
        $display={display}
        $posX={positionX}
        $posY={positionY}
      >
        <WindowWrapper title="open channels">
          <StyledUl>
            {channel.map((ch) => {
              return (
                <StyledLi key={key++} onClick={() => openChannel(ch)}>
                  {ch.type === EChannelType.PRIVATE && "private "}
                  {ch.type === EChannelType.PUBLIC && "public "}
                  {ch.title}{" "}
                </StyledLi>
              );
            })}
          </StyledUl>
        </WindowWrapper>
        <Input
          id="room"
          value={input}
          label="room"
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              openChannel({
                user: user,
                type: channelType,
                id: 0,
                title: input,
              });
            }
          }}
        />
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
