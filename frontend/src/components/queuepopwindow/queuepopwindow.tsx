import Button from "../button";
import { AuthContext } from "../../context/auth";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socket";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow";
import Progressbar from "../progressbar";
import { IQueueContext, QueueContext } from "../../context/queue";
import { queueTimeout } from "../gamewindow/properties";

interface IQueuepopwindowProps {}

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

const Queuepopwindow: React.FC<IQueuepopwindowProps> = (
  props: IQueuepopwindowProps
) => {
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
        <Moveablewindow
          title="Match Found"
          display={true}
          positionZ={100000}
          positionX={800}
          positionY={800}
        >
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
        </Moveablewindow>
      ) : null}
    </>
  );
};
export default Queuepopwindow;
