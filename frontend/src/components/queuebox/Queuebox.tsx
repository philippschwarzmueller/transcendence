import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { EGamemode } from "../queuebutton/Queuebutton";
import Queuebutton from "../queuebutton/Queuebutton";
import { SocketContext } from "../../context/socket";
import { IChangeSocketPayload } from "../refresh/SocketRefresh";
import { AuthContext } from "../../context/auth";
import { useCookies } from "react-cookie";
import Button from "../button";

const Win98Box = styled.div`
  width: 200px;
  height: 50px;

  text-align: center;
  min-width: 7rem;
  min-height: 2rem;
  display: flex;
  align-items: center;
  background-color: rgb(195, 199, 203);
  box-shadow: inset 1px 1px 0px 1px rgb(255, 255, 255),
    inset 0 0 0 1px rgb(134, 138, 142), 1px 1px 0px 1px rgb(0, 0, 0),
    2px 2px 5px 0px rgba(0, 0, 0, 0.5); /* Outer shadow */
  padding: 8px;
  cursor: pointer;
  &:focus {
    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;

    box-shadow: inset 1px 1px 0px 1px rgb(255, 255, 255),
      inset 0 0 0 1px rgb(134, 138, 142), 1px 1px 0 0px rgb(0, 0, 0);
  }

  &:active {
    padding: 8 20 4;

    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;

    box-shadow: inset 0 0 0 1px rgb(134, 138, 142), 0 0 0 1px rgb(0, 0, 0);
  }
`;

const Queuebox: React.FC = () => {
  const socket = useContext(SocketContext);
  const auth = useContext(AuthContext);
  const [userInQueue, setUserInQueue] = useState<boolean | null>(null);
  const [cookie, setCookie, deleteCookie] = useCookies(["queue"]);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, [auth, cookie]);

  const leaveQueue = () => {
    if (!auth.user.name) return;
    const payload: IChangeSocketPayload = { intraname: auth.user.name };
    socket.emit("leavequeue", payload);
    deleteCookie("queue");
    setTimer(0);
    const queueInterval = Number(localStorage.getItem("queueInterval"));
    localStorage.removeItem("queueInterval");
    clearInterval(queueInterval);
  };

  const startTimer = () => {
    const queueInterval = Number(localStorage.getItem("queueInterval"));
    localStorage.removeItem("queueInterval");
    clearInterval(queueInterval);
    const newQueueInterval = setInterval(() => {
      setTimer(Math.floor((Date.now() - cookie.queue.timestamp) / 1000));
    }, 1000);
    localStorage.setItem("queueInterval", String(newQueueInterval));
  };

  const fetchData = () => {
    if (!auth.user.name) return;
    const payload: IChangeSocketPayload = { intraname: auth.user.name };
    socket.emit("isplayerinqueue", payload, (res: boolean) => {
      setUserInQueue(res);
      if (res) {
        startTimer();
      }
    });
  };

  let content: React.ReactNode;

  if (userInQueue === null) {
    content = <></>;
  } else if (userInQueue === false) {
    content = (
      <Win98Box>
        <Queuebutton gamemode={EGamemode.standard} />
        <p></p>
        <Queuebutton gamemode={EGamemode.roomMovement} />
      </Win98Box>
    );
  } else {
    content = (
      <Win98Box>
        <p>Time elapsed: {timer} seconds</p>
        <Button onClick={leaveQueue}>Leave Queue</Button>
      </Win98Box>
    );
  }

  return <>{content}</>;
};

export default Queuebox;
