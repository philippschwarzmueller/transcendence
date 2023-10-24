import React, { useState, useEffect, useContext, useRef } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { ChatSocketContext } from "../../routes/root";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import { AuthContext, IUser } from "../../context/auth";
import Popup from "../popup/Popup";

const Msgfield = styled.div`
  width: 320px;
  padding: 10px;
  border: none;
  margin: 0;
  background-color: rgb(195, 199, 203);
`;

const Tabbar = styled.div`
  display: flex;
  padding: 0px;
  margin: 0px;
  border: none;
`;

const Textfield = styled.div`
  width: 334px;
  height: 200px;
  padding: 0px;
  margin: 0px;
  background-color: white;
  border-radius: 0px;
  border-width: 1px 0px 0px 1px;
  border-top-color: rgb(134, 138, 142);
  border-left-color: rgb(134, 138, 142);
  box-shadow:
    rgb(195, 199, 203) -1px -1px 0px 0px inset,
    rgb(0, 0, 0) 1px 1px 0px 0px inset,
    rgb(255, 255, 255) 0.5px 0.5px 0px 0.5px;
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

// not triggerable for actice state yet
const StyledLi = styled.li`
  list-style: none;
  display: list-item;
  padding: 5px;
  font-size: 14px;
  background-color: rgb(190, 190, 190);
  border: solid 1px;
  border-top-color: white;
  border-left-color: white;
  border-top-left-radius: 5px 5px;
  border-top-right-radius: 5px 5px;
  &:acive {
    background-color: rgb(195, 199, 203);
    border-bottom: none;
  }
  &:hover {
    background-color: rgb(195, 199, 203);
    border-bottom: none;
  }
`;

// has to be switched to links for individual chats
const StyledUl = styled.ul`
  padding: 5px;
  margin: 5px;
  list-style: none;
`;

const Chatwindow: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [room, setRoom] = useState<string>("general");
  const [tabs, setTabs] = useState<string[]>(["general"]);
  const socket: Socket = useContext(ChatSocketContext);
  let user: IUser = useContext(AuthContext).user;
  let listKey = 0;

  const msgField: any = useRef<HTMLCanvasElement | null>(null);
  const popupRef: any = useRef<typeof Popup | null>(null);

  socket.on("message", (res: string) => setMessages([...messages, res]));
  socket.on("room update", (res: string[]) => setTabs(res));

  useEffect(() => {
    if (user === undefined) return;
    socket.emit("join", { user, input, room }, (res: string[]) =>
      setMessages(res),
    );
  }, [room]); // eslint-disable-line react-hooks/exhaustive-deps

  function send(event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    if (user === undefined)
      setMessages([...messages, "you have to be logged in to chat!"]);
    if (input.trim() !== "" && user !== undefined)
      socket.emit("message", { user, input, room });
    setInput("");
  }

  useEffect(
    () =>
      msgField.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      }),
    [messages],
  );

  return (
    <>
      <Popup setRoom={setRoom} ref={popupRef} />
      <Moveablewindow>
        <Tabbar>
          {tabs.map((tab) => {
            return (
              <StyledLi onClick={() => setRoom(tab)} key={tab}>
                {tab}
              </StyledLi>
            );
          })}
          <StyledLi
            key="+"
            onClick={(e: React.MouseEvent) => popupRef.current.openRoom(e)}
          >
            +
          </StyledLi>
        </Tabbar>
        <Textfield>
          <StyledUl ref={msgField} id="msgField">
            {messages.map((mes) => {
              return <li key={listKey++}>{mes}</li>;
            })}
          </StyledUl>
        </Textfield>
        <Msgfield>
          <Input
            value={input}
            label="Type here"
            placeholder="Enter message"
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") send(e);
            }}
          ></Input>
          <Button onClick={(e: React.MouseEvent) => send(e)}>Send</Button>
          <Button
            onClick={() =>
              socket.emit("clear", room, (res: string[]) => setMessages(res))
            }
          >
            Clear
          </Button>
          <Button onClick={() => socket.emit("remove", room)}>Remove</Button>
        </Msgfield>
      </Moveablewindow>
    </>
  );
};

export default Chatwindow;
