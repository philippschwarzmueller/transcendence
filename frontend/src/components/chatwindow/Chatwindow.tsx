import React, { useState, useEffect } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { io } from "socket.io-client";

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
      <ul>
        {messages.map((mes) => {
          return <li key={mes}>{mes}</li>;
        })}
      </ul>
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
    </>
  );
};

export default Chatwindow;
