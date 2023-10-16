import React, { useState, useEffect, useContext } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { ChatSocketContext } from "../../routes/root";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import { getCookie } from "../../routes/GetToken"

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

// has to be switched to links for individual chats
const StyledUl = styled.ul`
  list-style: none;
`;

const Chatwindow: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const socket: Socket = useContext(ChatSocketContext);
  const user = getCookie("user");
  let listKey = 0;

  useEffect(() => {
    socket.on("message", (res: string) => setMessages([...messages, res]));
  }, [socket, messages]);

  function send(event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    if (input.trim() !== "") {
      socket.emit("message", { user, input });
      setInput("");
    }
  }

  return (
    <>
      <Moveablewindow>
        <Tabbar>
          <StyledLi>tab</StyledLi>
          <StyledLi>anothertab</StyledLi>
        </Tabbar>
        <Textfield>
          <StyledUl>
            {messages.map((mes) => {
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
