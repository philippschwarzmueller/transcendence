import styled from "styled-components"
import React, { useState, useEffect } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import { io } from "socket.io-client";

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
  box-shadow: rgb(195, 199, 203) -1px -1px 0px 0px inset,
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
  let [messages, setMessages] = useState<string[]>([]);
  let [input, setInput] = useState("");
  let [socket, setSocket] = useState(io("ws://localhost:8080"));

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
  }, [socket]);

  function send(event: React.MouseEvent): void {
    event.preventDefault();
    if (input.trim() !== "") {
      socket.emit("message", input, (res: any) =>
        setMessages([...messages, res]),
      );
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
            return <li key={mes}>{mes}</li>;
          })}
        </StyledUl>
      </Textfield>
      <Msgfield>
        <Input
          value={input}
          label="Type here"
          placeholder="Enter message"
          onChange={(e) => setInput(e.target.value)}
        ></Input>
        <Button onClick={(event: React.MouseEvent) => send(event)}>Send</Button>
        <Button onClick={() => setSocket(io("ws://localhost:8080"))}>
        Connect
        </Button>
        <Button onClick={() => socket.disconnect()}>Disconnect</Button>
      </Msgfield>
    </Moveablewindow>
    </>
  );
};

export default Chatwindow;
