import React, { useState, useEffect, useContext, useRef } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { ChatSocketContext } from "../../routes/root";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import { AuthContext, IUser } from "../../context/auth";
import Popup from "../popup/Popup";
import { IGameStart } from "../gamewindow/properties";
import { useNavigate } from "react-router-dom";

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
  margin-bottom: 5px;
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

const StyledLi = styled.li<{$active: string}>`
  list-style: none;
  display: list-item;
  padding: 5px;
  font-size: 14px;
  border: solid 1px;
  border-top-color: white;
  border-left-color: white;
  border-top-left-radius: 5px 5px;
  border-top-right-radius: 5px 5px;
  cursor: pointer;
  background-color: ${(props) =>
    props.$active === 'true' ? 'rgb(195, 199, 203)' : 'rgb(180, 180, 190)'};
  border-bottom-color: ${(props) => props.$active === 'true' ? 'rgb(195, 199, 203)' : 'black'};
`;

const StyledUl = styled.ul`
  padding: 5px;
  margin: 5px;
  list-style: none;
`;

const Chatwindow: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const user: IUser = useContext(AuthContext).user;
  let [tabs, setTabs] = useState<string[]>(user.activeChats);
  const [activeTab, setActiveTab] = useState<string>("");
  const [room, setRoom] = useState<string>("general");
  const socket: Socket = useContext(ChatSocketContext);
  const navigate = useNavigate();
  let listKey = 0;

  const msgField: any = useRef<HTMLCanvasElement | null>(null);
  const roomRef: any = useRef<typeof Popup | null>(null);

  socket.on("message", (res: string) => setMessages([...messages, res]));
  socket.on("game", (body: IGameStart) => {
    navigate(`/play/${body.gameId}/${body.side}`);
  });

  useEffect(() => {
    if (user === undefined) return;
    socket.emit("join", { user, input, room }, (res: string[]) =>
      setMessages(res),
    );
  }, [room]);

  useEffect(
    () =>
      msgField.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      }),
    [messages],
  );

  function send(event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    if (user === undefined)
      setMessages([...messages, "you have to be logged in to chat!"]);
    if (input.trim() !== "" && user !== undefined)
      socket.emit("message", { user, input, room });
    setInput("");
  }

  const setActive = (tab: string) => {
    setActiveTab(tab);
    setRoom(tab);
  }

  function closeTab(tab: string) {
    console.log(`closing ${tab}`);
  }

  return (
    <>
      <Popup
        onKey={setRoom}
        placeholder="type room name here"
        user={user}
        ref={roomRef}
        setTabs={setTabs}
      >
        Create
      </Popup>
      <Moveablewindow>
        <Tabbar>
          {tabs.map((tab) => {
            return (
              <StyledLi onClick={() => setActive(tab)} key={tab} $active={(tab == activeTab) ? 'true' : 'false'}>
                {tab}
              </StyledLi>
            );
          })}
          <StyledLi
            key="+"
            $active={'false'}
            onClick={(e: React.MouseEvent) => roomRef.current.openRoom(e)}
          >
            +
          </StyledLi>
          <Button onClick={() => closeTab(activeTab)} $position="absolute" $top="35px" $right="20px">Close</Button>
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
          <Button
            onClick={() => {
              socket.emit("remove", room);
              fetch(
                `http://${window.location.hostname}:4000/chat?userId=${user.name}`,
                { method: "DELETE" },
              );
            }}
          >
            Remove
          </Button>
        </Msgfield>
      </Moveablewindow>
    </>
  );
};

export default Chatwindow;
