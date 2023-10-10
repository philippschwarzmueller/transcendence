import React, { useState, useEffect } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { io } from "socket.io-client";

const Chatwindow: React.FC = () => {
  let [messages, setMessages] = useState<string[]>([]);
  let [input, setInput] = useState("");
  let [socket, setSocket] = useState(
    io(`http://${window.location.hostname}:${8080}`),
  );
  const user = sessionStorage.getItem("user");
  let counter = 0;

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
    socket.on("message", (res: string) => setMessages([...messages, res]));
  }, [socket, messages]);

  function send(event: React.MouseEvent): void {
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
          return <li key={counter++}>{mes}</li>;
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
      <Button
        onClick={() =>
          socket.emit("room", "chat", (res: string) => console.log(res))
        }
      >
        Join Room
      </Button>
    </>
  );
};

export default Chatwindow;
