import Button from "../button";
import { Socket } from "socket.io-client";
import { AuthContext, IUser } from "../../context/auth";
import { useContext} from "react";
import { SocketContext } from "../../context/socket";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow";
import Progressbar from "../progressbar";
import { IQueueContext, QueueContext } from "../../context/queue";

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

const handleAccept = (socket: Socket, intraname: string | undefined): void => {
  if (intraname) socket.emit("accept", intraname);
};

const handleDecline = (socket: Socket, intraname: string | undefined): void => {
  if (intraname) socket.emit("decline", intraname);
};

const Queuepopwindow: React.FC<IQueuepopwindowProps> = (
  props: IQueuepopwindowProps
) => {
  const socket = useContext(SocketContext);
  const auth = useContext(AuthContext);
  const queue: IQueueContext = useContext(QueueContext);

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
              <p>A match has been found, do you want to accept or decline?</p>
            </TextDiv>
            <LoadingDiv>
              <Progressbar totalTime={5}></Progressbar>
            </LoadingDiv>
            <ButtonDiv>
              <Button
                onClick={() => {
                  handleAccept(socket, auth.user.intraname);
                  queue.setQueueFound(false);
                }}
              >
                Accept
              </Button>
              <Button
                onClick={() => {
                  handleDecline(socket, auth.user.intraname);
                  queue.setQueueFound(false);
                }}
              >
                Decline
              </Button>
            </ButtonDiv>
          </Wrapper>
        </Moveablewindow>
      ) : null}
    </>
  );
};
export default Queuepopwindow;
