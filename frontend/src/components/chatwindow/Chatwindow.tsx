import React, { useState } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { io } from "socket.io-client";

interface IChatwindow {}

const Chatwindow: React.FC<IChatwindow> = (props: IChatwindow) => {
  let [messages, setMessages] = useState<string[]>([]);
  let [input, setInput] = useState("");

  const socket = io("ws://localhost:8080");
  socket.on("connect", () => {
    console.log(socket.id);
  });
  socket.on("disconnect", () => {
    console.log(socket.id); // undefined
  });

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
          return <li>{mes}</li>;
        })}
      </ul>
      <Input
        label="Type here"
        placeholder="Enter message"
        onChange={(e) => setInput(e.target.value)}
      ></Input>
      <Button onClick={() => setMessages([...messages, input])}>Send</Button>
      <Button onClick={(event: React.MouseEvent) => send(event)}>Test</Button>
    </>
  );
};

export default Chatwindow;
