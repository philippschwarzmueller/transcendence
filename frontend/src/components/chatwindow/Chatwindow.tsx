import styled from "styled-components"
import React, { useState, useEffect } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { io } from "socket.io-client";

const Msgfield = styled.div`
  width: 320px;
  padding: 10px;
  border: none;
  margin: 0;
  background-color: rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);
`;

const Window = styled.div`
`;

const ChatNav = styled.div`
  width: 320px;
  padding: 10px;
  background-color: rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);

`;

const Textfield = styled.div`
  width: 334px;
  height: 200px;
  background-color: white;
  border: 3px solid rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);
`;

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

  function move(event: React.MouseEvent): void {
    }

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
    <Window>
    <ChatNav onClick={(event: React.MouseEvent) => move(event)}>ClickHere</ChatNav>
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
    </Window>
    </>
  );
};

export default Chatwindow;
