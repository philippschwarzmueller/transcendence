// import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import React, { useState } from "react";
import Input from "../input/Input";
import Button from "../button/Button";

interface IChatwindow {}

const Chatwindow: React.FC<IChatwindow> = (props: IChatwindow) => {
  let [messages, setMessages] = useState<string[]>([]);
  let [input, setInput] = useState("");
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
    </>
  );
};

export default Chatwindow;
