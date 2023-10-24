import React, { useState, useEffect, useContext, useRef } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { ChatSocketContext } from "../../routes/root";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import { AuthContext } from "../../context/auth";

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

const InputField = styled.div<{
  $display: boolean;
  $posX: number;
  $posY: number;
}>`
  display: ${(props) => (props.$display ? "" : "none")};
  position: absolute;
  z-index: 100;
  padding: 5px;
  left: ${(props) => props.$posX + "px"};
  top: ${(props) => props.$posY + "px"};
  background-color: rgb(195, 199, 203);
  min-width: 100px;
  margin-block-start: 0px;
  margin-inline-start: 0px;
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e, 1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow,0 0 #0000),var(--x-shadow);
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
  const [rinput, setRinput] = useState<string>("");
  const [uinput, setUinput] = useState<string>("");
  const [reciever, setRoom] = useState<string>("");
  const socket: Socket = useContext(ChatSocketContext);
  const user = useContext(AuthContext).user.name;
  const activeChats = useContext(AuthContext).user.activeChats;
  const [tabs, setTabs] = useState<string[]>(activeChats);
  let listKey = 0;
  let [display, setDisplay] = useState<boolean>(false);
  let [positionX, setPositionX] = useState<number>(0);
  let [positionY, setPositionY] = useState<number>(0);

  const msgField: any = useRef<HTMLCanvasElement | null>(null);

  socket.on("message", (res: string) => setMessages([...messages, res]));
  socket.on("reciever update", (res: string[]) => setTabs(res));

  useEffect(() => {
    if (user === undefined) return;
    socket.emit("join", { user: user, input, reciever }, (res: string[]) =>
      setMessages(res),
    );
  }, [reciever]); // eslint-disable-line react-hooks/exhaustive-deps

  function send(event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    if (user === undefined)
      setMessages([...messages, "you have to be logged in to chat!"]);
    if (input.trim() !== "" && user !== undefined)
      socket.emit("message", { user: user, input, reciever });
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

  function openRoom(event: React.MouseEvent) {
    event.preventDefault();
    setPositionX(event.pageX);
    setPositionY(event.pageY);
    setDisplay(!display);
  }

  function setUser(user: string) {
    try {
      fetch(`http://${window.location.hostname}:4000/users/${user}`);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  return (
    <>
      <InputField $display={display} $posX={positionX} $posY={positionY}>
        For room creation:
        <Input
          value={rinput}
          label="Type here"
          placeholder="Enter room name"
          onChange={(e) => setRinput(e.target.value)}
          onKeyUp={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              activeChats.push(rinput);
              setRoom(rinput);
              setDisplay(false);
              setRinput("");
            }
          }}
        ></Input>
        for User chat:
        <Input
          value={uinput}
          label="here"
          placeholder="Enter reciever name"
          onChange={(e) => setUinput(e.target.value)}
          onKeyUp={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              if (setUser(uinput)) {
                setRoom(uinput);
                setDisplay(false);
                setUinput("");
              }
              else {
                setUinput("")
              }
            }
          }}
        ></Input>
      </InputField>
      <Moveablewindow>
        <Tabbar>
          {tabs.map((tab) => {
            return (
              <StyledLi onClick={() => setRoom(tab)} key={tab}>
                {tab}
              </StyledLi>
            );
          })}
          <StyledLi key="+" onClick={(e: React.MouseEvent) => openRoom(e)}>
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
              socket.emit("clear", reciever, (res: string[]) => setMessages(res))
            }
          >
            Clear
          </Button>
          <Button onClick={() => socket.emit("remove", reciever)}>Remove</Button>
        </Msgfield>
      </Moveablewindow>
    </>
  );
};

export default Chatwindow;
