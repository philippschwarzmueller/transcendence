import React from "react";
import Pagetitle from "../components/pagetitle/Pagetitle";
import Chatwindow from "../components/chatwindow/Chatwindow";
import Taskbar from "../components/taskbar/Taskbar";

const Chat: React.FC = () => {
  return (
    <>
      <Taskbar />
      <Pagetitle>Chat</Pagetitle>
      <Chatwindow $display={true} />
    </>
  );
};

export default Chat;
