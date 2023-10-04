import React from "react";
import Pagetitle from "../components/pagetitle/Pagetitle";
import Chatwindow from "../components/chatwindow/Chatwindow";

const Chat: React.FC = () => {
  return (
    <>
      <Pagetitle>Chat</Pagetitle>
      <Chatwindow />
    </>
  );
};

export default Chat;
