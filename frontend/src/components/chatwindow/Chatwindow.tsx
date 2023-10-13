import React, { useState, useEffect, useContext } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { ChatSocketContext } from "../../routes/root";
import { Socket } from "socket.io-client";

const Chatwindow: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const socket: Socket = useContext(ChatSocketContext);
  const user = sessionStorage.getItem("user");
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
      <ul>
        {messages.map((mes) => {
          return <li key={listKey++}>{mes}</li>;
        })}
      </ul>
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
    </>
  );
};

export default Chatwindow;
