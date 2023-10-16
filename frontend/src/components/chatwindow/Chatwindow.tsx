import React, { useState, useEffect, useContext } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { ChatSocketContext } from "../../routes/root";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow/Moveablewindow";

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
  background-color: white;
  border-radius: 0px;
  border-width: 1px 0px 0px 1px;
  border-top-color: rgb(134, 138, 142);
  border-left-color: rgb(134, 138, 142);
  box-shadow:
    rgb(195, 199, 203) -1px -1px 0px 0px inset,
    rgb(0, 0, 0) 1px 1px 0px 0px inset,
    rgb(255, 255, 255) 0.5px 0.5px 0px 0.5px;
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

// has to be switched to links for individual chats
const StyledUl = styled.ul`
  list-style: none;
`;

const Chatwindow: React.FC = () => {
  const [messages, setMessages] = useState<string[][]>([[]]);
  const [input, setInput] = useState<string>("");
  const [rinput, setRinput] = useState<string>("");
  const [room, setRoom] = useState<string>("general");
  const [tabs, setTabs] = useState<string[]>(["general"]);
  const socket: Socket = useContext(ChatSocketContext);
  const user = sessionStorage.getItem("user");
  let listKey = 0;
  let [display, setDisplay] = useState<boolean>(false);
  let [positionX, setPositionX] = useState<number>(0);
  let [positionY, setPositionY] = useState<number>(0);

  useEffect(() => {
    socket.emit("join", { user, input, room });
  }, []);

  useEffect(() => {
    socket.on("message", (res: string) => addStringToMessages(res));
  }, [socket]);

  function send(event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    if (input.trim() !== "") {
      addStringToMessages(`me: ${input}`);
      socket.emit("message", { user, input, room });
      setInput("");
    }
  }

  const addStringToMessages = (newString: string) => {
    const messagesCopy = [...messages];
    if (!messagesCopy[tabs.indexOf(room)]) {
      messagesCopy[tabs.indexOf(room)] = [];
    }
    messagesCopy[tabs.indexOf(room)].push(newString);
    setMessages(messagesCopy);
  };

  function joinRoom(event: React.KeyboardEvent) {
    console.log(rinput);
    setRoom(rinput);
    setMessages([...messages, []]);
    setTabs([...tabs, room]);
    socket.emit("join", { user, input, room });
    setRinput("");
  }

  function openRoom(event: React.MouseEvent) {
    setPositionX(event.pageX);
    setPositionY(event.pageY);
    setDisplay(!display);
  }

  return (
    <>
      <InputField $display={display} $posX={positionX} $posY={positionY}>
        This is a WIP
        <Input
          value={rinput}
          label="Type here"
          placeholder="Enter room name"
          onChange={(e) => setRinput(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") joinRoom(e);
          }}
        ></Input>
      </InputField>
      <Moveablewindow>
        <Tabbar>
          {tabs.map((tab) => {
            return (
              <StyledLi onClick={(e: React.MouseEvent) => setRoom(tab)}>
                {tab}
              </StyledLi>
            );
          })}
          <StyledLi onClick={(e: React.MouseEvent) => openRoom(e)}>+</StyledLi>
        </Tabbar>
        <Textfield>
          <StyledUl>
            {messages[tabs.indexOf(room)].map((mes) => {
              return <li key={listKey}>{mes}</li>;
            })}
          </StyledUl>
        </Textfield>
        <Msgfield>
          <Input
            value={input}
            label="Type here"
            placeholder="Enter message"
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") send(e);
            }}
          ></Input>
          <Button onClick={(e: React.MouseEvent) => send(e)}>Send</Button>
        </Msgfield>
      </Moveablewindow>
    </>
  );
};

export default Chatwindow;
