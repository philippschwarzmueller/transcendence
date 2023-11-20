import { useState } from "react";
import { styled } from "styled-components";
import Chatwindow from "../chatwindow/Chatwindow";
import Userbrowser from "../userbrowser";

const StyledNavbar = styled.nav`
  width: 100vw;
  height: 3vh;
  display: flex;
  z-index: 2;
  position: absolute;
  bottom: 0;
  background-color: rgb(195, 199, 203);
  box-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  align-items: center;
`;

const TaskButton = styled.button<{ $active: boolean }>`
  box-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  width: auto;
  height: auto;
  background-color: rgb(195, 199, 203);
  border: none;
  padding: 2px, 3px;
  margin: 2px;
  outline: none;
  display: flex;
  text-align: center;
  font-size: 22px;
  justify-content: flex-start;
  cursor: pointer;
  &:focus {
    box-shadow: inset 1px 1px 0px 1px rgb(255, 255, 255),
      inset 0 0 0 1px rgb(134, 138, 142), 1px 1px 0 0px rgb(0, 0, 0);
    background-color: rgb(215,216,220);
  }
  &:active {
    padding: 8 20 4;
    background-color: rgb(215,216,220);

    box-shadow: inset 0 0 0 1px rgb(134, 138, 142), 0 0 0 1px rgb(0, 0, 0);
  }
`;

const StartMenu = styled.div<{ $display: boolean}>`
  display: ${(props) => (props.$display ? "flex" : "none")};
  position: absolute;
  bottom: 38px;
  border: none;
  left: 2px;
  z-index: 4;
  background-color: rgb(195, 199, 203);
  box-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
`;

const StyledUl = styled.ul`
  list-style: none;
  margin:4px;
  padding:0px;
  border: none;
  width: 200px;
`;

const Seperator = styled.li`
  border-top: 1px solid white;
  border-bottom: 1px solid black;
`;

const StyledLi = styled.li`
  font-size: 22px;
  cursor: pointer;
  &:hover {
      background-color: rgb(0, 14, 122);
      color: white;
    }
`;

const TextBar = styled.div`
  width: 40px;
  background-color: grey;
  margin: 2px;
  writing-mode: vertical-lr;
  color: rgb(195, 199, 203);
  font-size: 30px;
  cursor: default;
`;

const Taskbar: React.FC = () => {
  const [displayChat, setDisplayChat] = useState<boolean>(false);
  const [displayUsers, setDisplayUsers] = useState<boolean>(false);
  const [displayStart, setDisplayStart] = useState<boolean>(false);

  return (
    <>
    <Chatwindow $display={displayChat} />
    <Userbrowser $display={displayUsers} />
    <StartMenu $display={displayStart}>
      <TextBar>Transcendence95</TextBar>
      <StyledUl>
        <StyledLi>👤Profile</StyledLi>
        <Seperator />
        <StyledLi onClick={() => setDisplayUsers(!displayUsers)}>👥Users</StyledLi>
        <StyledLi>📄Blocklist</StyledLi>
        <StyledLi>👥Friends</StyledLi>
        <Seperator />
        <StyledLi>🏆Stats</StyledLi>
        <Seperator />
        <StyledLi>👤Login</StyledLi>
      </StyledUl>
    </StartMenu>
    <StyledNavbar>
      <TaskButton $active={displayStart} onClick={() => setDisplayStart(!displayStart)}>
      <img width="26" height="26" alt="Windows95 Logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABJklEQVR4Ae3BW26bUAAFwDmIfYNXfkq5UWyq0LyI2g/PePpf1D8yu059TDyIoyI+p74mNpNzda6G+rrazDalIYihjoqgTqyGxRAvargZVgezczHUO+oDFsOCeDXZhNiUGuIo7oK4yOREqSHuYlPqIpOhNiE2pR6U2pSWutDkRIhNqR80G2IoEuJBiBch3nAzrP4Qw2pYHMRREUMRbyuC+p7Mdi0JYqijIqhTq2ExxG+t3e1mt64OZudiqHfVe5bFbllIvJrsErvWEEdxF8RFJqdaQ9zFrnWRyVC7xK510Nq1tC40OZXYtX7QbIihCImDxKvEm26G1aPEbl3tlsVBHBUxFPG2IqjvyeQohjqqoagLzc7FUB8Xf1dfUHd1VNTnFfX09LT5BT2CXilFFQW0AAAAAElFTkSuQmCC" />
      Start
      </TaskButton>
      <TaskButton $active={displayChat} onClick={() => setDisplayChat(!displayChat)}>
      Chat
      </TaskButton>
      </StyledNavbar>
    </>
  );
};

export default Taskbar;
