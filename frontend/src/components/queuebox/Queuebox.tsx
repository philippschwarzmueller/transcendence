import React, { createContext, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { EGamemode } from "../queuebutton/Queuebutton";
import Queuebutton from "../queuebutton/Queuebutton";
import { SocketContext } from "../../context/socket";
import { IChangeSocketPayload } from "../refresh/SocketRefresh";
import { AuthContext } from "../../context/auth";
import { useCookies } from "react-cookie";

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
  const cookie = useCookies(["queue"]);
  useEffect(() => {
    fetchData();
  }, [auth, cookie]);

  const fetchData = async () => {
    console.log("fetching data");
    if (!auth.user.name) return;
    const payload: IChangeSocketPayload = { intraname: auth.user.name };
    socket.emit("isplayerinqueue", payload, (res: boolean) => {
      setUserInQueue(res);
      console.log("fetched: ", res);
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
        <p>Placeholder Text</p>
      </Win98Box>
    );
  }

  return <>{content}</>;
};

export default Queuebox;
