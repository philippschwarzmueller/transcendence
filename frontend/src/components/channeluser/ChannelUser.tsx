import {
  forwardRef,
  Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { styled } from "styled-components";
import { IUser } from "../../context/auth";
import { SocketContext } from "../../context/socket";
import Playercard from "../playercard/Playercard";

const StyledDiv = styled.div<{
  $display: boolean;
  $posX: number;
  $posY: number;
}>`
  padding: 10px;
  z-index: 400;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  user-select: none;
  left: ${(props) => props.$posX + "px"};
  top: ${(props) => props.$posY + "px"};
  display: ${(props) => (props.$display ? "flex" : "none")};
  background-color: rgb(195, 199, 203);
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 1px 0px 1px;
`;

const StyledUl = styled.ul`
  border: none;
  margin: 0px;
  padding: 2px;
  list-style: none;
  width: auto;
`;

interface props {
  id: number;
}

interface refs {
  openBrowser: (event: React.MouseEvent) => void;
}

function ChannelUser({ id }: props, ref: Ref<refs>) {
  const [display, setDisplay] = useState<boolean>(false);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [users, setUsers] = useState<IUser[]>([]);
  const socket = useContext(SocketContext);

  useImperativeHandle(ref, () => ({
    openBrowser,
  }));

  function openBrowser(event: React.MouseEvent) {
    setPositionX(event.pageX);
    setPositionY(event.pageY);
    setDisplay(!display);
  }

  useEffect(() => {
    socket.emit('getChannelUser', id, (res: IUser[]) => setUsers(res));
  }, [display]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <StyledDiv
        $display={display}
        $posX={positionX}
        $posY={positionY}
        onMouseLeave={() => setDisplay(!display)}
      >
        {"Channel users"}
        <StyledUl>
          {users.map((user) => {
            return <Playercard user={user} key={user.name} />;
          })}
        </StyledUl>
      </StyledDiv>
    </>
  );
}

export default forwardRef(ChannelUser);
