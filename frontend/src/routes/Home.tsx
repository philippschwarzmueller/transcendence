import Taskbar from "../components/taskbar/Taskbar";
import Gameicon from "../components/gameicon/Gameicon";
import { useContext, useState } from "react";
import { SocketContext } from "../context/socket";
import { IUser } from "../context/auth";
import { useNavigate } from "react-router-dom";
import { IGameStart } from "../components/gamewindow/properties";
import Invitepopwindow from "../components/invitepopwindow";

const Home: React.FC = () => {
  const [challenger, setChallenger] = useState<IUser | null>(null);
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
