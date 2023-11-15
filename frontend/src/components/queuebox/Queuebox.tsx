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
  background-color: #c0c0c0;
  border: 2px solid #000000;
  padding: 10px;
  margin: 10px;
  font-family: "Arial", sans-serif;
  font-size: 12px;
  width: 300px;
`;

const Queuebox: React.FC = () => {
  const socket = useContext(SocketContext);
  const auth = useContext(AuthContext);
  const [userInQueue, setUserInQueue] = useState<boolean | null>(null);
  const [cookie, setCookie, deleteCookie] = useCookies(["queue"]);
  const [timer, setTimer] = useState<number>(0);
  const [timerId, setTimerId] = useState<any>();

  useEffect(() => {
    fetchData();
  }, [auth, cookie]);

  const leaveQueue = () => {
    if (!auth.user.name) return;
    const payload: IChangeSocketPayload = { intraname: auth.user.name };
    socket.emit("leavequeue", payload);
    deleteCookie("queue");
    // Reset the timer when leaving the queue
    setTimer(0);
    clearInterval(timerId);
  };

  const startTimer = () => {
    const intervalId = setInterval(() => {
      setTimer(Math.floor((Date.now() - cookie.queue.timestamp) / 1000));
    }, 1000);
    setTimerId(intervalId);

    // Uncomment the line below if you want to stop the timer after a certain duration
    // setTimeout(() => clearInterval(intervalId), duration);
  };

  const fetchData = async () => {
    console.log("fetching data");
    if (!auth.user.name) return;
    const payload: IChangeSocketPayload = { intraname: auth.user.name };
    socket.emit("isplayerinqueue", payload, (res: boolean) => {
      setUserInQueue(res);
      console.log("fetched: ", res);
      if (res) {
        // If the user is in the queue, start the timer
        startTimer();
      }
    });
  };

  let content: React.ReactNode;

  if (userInQueue === null) {
    content = <div>Loading...</div>;
  } else if (userInQueue === false) {
    content = (
      <Win98Box>
        <Queuebutton gamemode={EGamemode.standard} />
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
