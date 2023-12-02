import Button from "../button";
import { AuthContext } from "../../context/auth";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socket";
import styled from "styled-components";
import Progressbar from "../progressbar";
import { IQueueContext, QueueContext } from "../../context/queue";
import { queueTimeout } from "../gamewindow/properties";

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

const Queuepopwindow: React.FC = () => {
  const socket = useContext(SocketContext);
  const auth = useContext(AuthContext);
  const queue: IQueueContext = useContext(QueueContext);
  const [windowText, setWindowText] = useState<string>(
    "A match has been found, do you want to accept or decline?"
  );
  const [windowButtons, setWindowButtons] = useState(<></>);

  const handleAccept = (): void => {
    if (auth.user.intraname) socket.emit("accept", auth.user.intraname);
    setWindowText("waiting for the other player");
    setWindowButtons(<></>);
  };

  const handleDecline = (): void => {
    if (auth.user.intraname) socket.emit("decline", auth.user.intraname);
    queue.setQueueFound(false);
  };

  useEffect(() => {
    if (queue.denied === true) {
      setWindowButtons(
        <Button onClick={() => queue.setQueueFound(false)}>go back</Button>
      );
      setWindowText("Your opponent denied");
    } else {
      setWindowButtons(
        <>
          <Button onClick={handleAccept}>Accept</Button>
          <Button onClick={handleDecline}>Decline</Button>
        </>
      );
      setWindowText(
        "A match has been found, do you want to accept or decline?"
      );
    }
  }, [queue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {queue.queueFound ? (
        <StyledWindow>
          <Windowbar>Match Found</Windowbar>
          <Wrapper>
            <TextDiv>
              <p>{windowText}</p>
            </TextDiv>
            <LoadingDiv>
              {!queue.denied ? (
                <Progressbar totalTime={queueTimeout}></Progressbar>
              ) : null}
            </LoadingDiv>
            <ButtonDiv>{windowButtons}</ButtonDiv>
          </Wrapper>
        </StyledWindow>
      ) : null}
    </>
  );
};
export default Queuepopwindow;
