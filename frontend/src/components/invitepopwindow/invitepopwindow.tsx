import Button from "../button";
import { AuthContext, IUser } from "../../context/auth";
import { useContext } from "react";
import { SocketContext } from "../../context/socket";
import styled from "styled-components";
import Progressbar from "../progressbar";
import { queueTimeout } from "../gamewindow/properties";

interface IInvitepopwindowProps {
  challenger: IUser | null;
}

const StyledWindow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 5px;
  background-color: rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);
  z-index: 2000;
`;

const Windowbar = styled.div`
  height: 18px;
  margin-bottom: 2px;
  padding: 2px;
  display: flex;
  gap: 10px;
  box-shadow: none;
  background: rgb(0, 14, 122);
  color: White;
  font-size: 1em;
  cursor: default;
`;

const Wrapper = styled.div`
  width: 400px;
  height: 150px;
  border: 1px solid black;
`;

const ButtonDiv = styled.div`
  justify-content: space-around;
  align-items: center;
  display: flex;
  margin: 15px;
`;

const TextDiv = styled.div`
  margin: 15px;
`;

const LoadingDiv = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  margin: 15px;
`;

const Invitepopwindow: React.FC<IInvitepopwindowProps> = (
  {challenger}: IInvitepopwindowProps
) => {
  const socket = useContext(SocketContext);
  const auth = useContext(AuthContext);

  const handleAccept = (): void => {
    if (auth.user.intraname) socket.emit("acceptgame", {challenger: challenger, challenged: auth.user});
  };

  const handleDecline = (): void => {
    if (auth.user.intraname) socket.emit("declinegame", auth.user);
  };

  return (
    <>
      {challenger ? (
        <StyledWindow>
        <Windowbar>Challenge received</Windowbar>
          <Wrapper>
            <TextDiv>
              <p>{challenger?.name} challenges you to a game</p>
            </TextDiv>
            <LoadingDiv>
                <Progressbar totalTime={queueTimeout}></Progressbar>
            </LoadingDiv>
            <ButtonDiv>
            <Button onClick={handleAccept}>Accept</Button>
            <Button onClick={handleDecline}>Decline</Button>
            </ButtonDiv>
          </Wrapper>
        </StyledWindow>
      ) : null}
    </>
  );
};
export default Invitepopwindow;
