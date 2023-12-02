import Taskbar from "../components/taskbar/Taskbar";
import Gameicon from "../components/gameicon/Gameicon";
import { useContext, useState } from "react";
import { SocketContext } from "../context/socket";
import { AuthContext, IUser } from "../context/auth";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IGameStart } from "../components/gamewindow/properties";
import Invitepopwindow from "../components/invitepopwindow";

const StyledDiv = styled.div`
  text-align: center;
  min-width: 7rem;
  min-height: 2rem;
  display: flex;
  align-items: center;
  background-color: rgb(195, 199, 203);
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 1px 0px 1px;
  padding: 8px;
  cursor: pointer;
  &:active {
    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;
    box-shadow:
      inset 0 0 0 1px rgb(134, 138, 142),
      0 0 0 1px rgb(0, 0, 0);
  }
`;

const Home: React.FC = () => {
  const [challenger, setChallenger] = useState<IUser | null>(null);
  const user = useContext(AuthContext).user;
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  socket.on('challenge', (res: IUser) => setChallenger(res));
  socket.on("gamesubmit", (body: IGameStart) => {
    navigate(`/play/${body.gameId}/${body.side}`);
  });
  return (
    <>
      <Invitepopwindow challenger={challenger}/>
      <Gameicon />
      <Taskbar />
    </>
  );
};

export default Home;
