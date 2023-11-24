import { NavigateFunction, useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { AuthContext, IUser } from "../../context/auth";
import { useContext, useEffect } from "react";
import { SocketContext } from "../../context/socket";
import { useCookies } from "react-cookie";
import styled from "styled-components";
import Moveablewindow from "../moveablewindow";

interface IQueuepopwindowProps {}

const Wrapper = styled.div`
  width: 400px;
  height: 180px;
  border: 1px solid black;
`;

const ButtonDiv = styled.div`
  justify-content: space-around;
  align-items: center;
  display: flex;
`;

const TextDiv = styled.div``;

const LoadingDiv = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;

const Queuepopwindow: React.FC<IQueuepopwindowProps> = (
  props: IQueuepopwindowProps
) => {
  return (
    <>
      <Moveablewindow
        title="Match Found"
        display={true}
        positionZ={100000}
        positionX={800}
        positionY={800}
      >
        <Wrapper>
          <TextDiv>
            <p>A match has been found, do you want to accept or decline</p>
          </TextDiv>
          <LoadingDiv>
            <p>LOADING BAR</p>
          </LoadingDiv>
          <ButtonDiv>
            <Button onClick={() => console.log("accpet")}>Accept</Button>
            <Button onClick={() => console.log("decline")}>Decline</Button>
          </ButtonDiv>
        </Wrapper>
      </Moveablewindow>
    </>
  );
};

export default Queuepopwindow;
