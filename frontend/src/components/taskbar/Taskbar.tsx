import { useState } from "react";
import { styled } from "styled-components";
import Chatwindow from "../chatwindow/Chatwindow";
import Leaderboard from "../leaderboard/leaderboard";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import Profilesettings from "../profilesettings/Profilesettings";
import Profilewindow from "../profilewindow/Profilewindow";
import Queuebox from "../queuebox/Queuebox";
import Userbrowser from "../userbrowser";

const StyledNavbar = styled.nav`
  width: 100vw;
  height: 3vh;
  display: flex;
  z-index: 2;
  position: absolute;
  bottom: 0;
  background-color: rgb(195, 199, 203);
  box-shadow:
    inset 0.5px 0.5px 0px 0.5px #ffffff,
    inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000,
    0px 1px 0 0px #000000,
    1px 1px 0 0px #000000;
  align-items: center;
`;

const TaskButton = styled.button<{ $active: boolean }>`
  width: auto;
  align-items: center;
  height: 2.4vh;
  background-color: rgb(195, 199, 203);
  border: none;
  padding: 2px, 3px;
  margin: 2px;
  outline: none;
  display: flex;
  text-align: center;
  font-size: ${(props) => (props.$active ? "2.2vh" : "2.2vh")};
  justify-content: flex-start;
  cursor: pointer;
  outline: ${(props) => (props.$active ? "black dotted 1px" : "")};
  outline-offset: -4px;
  &:active {
    padding: 8 20 4;
    background-color: rgb(215, 216, 220);

    box-shadow:
      inset 0 0 0 1px rgb(134, 138, 142),
      0 0 0 1px rgb(0, 0, 0);
  }
  box-shadow: ${(props) =>
    props.$active
      ? "inset 0px 0px 0px 0px, inset 1px 1px 0px 0px #868a8e, 0.5px 0.5px 0px 0.5px #ffffff;"
      : "inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e, 1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000"};
`;

const StartMenu = styled.div<{ $display: boolean }>`
  display: ${(props) => (props.$display ? "flex" : "none")};
  position: absolute;
  bottom: 3.1vh;
  border: none;
  left: 2px;
  z-index: 4;
  background-color: rgb(195, 199, 203);
  box-shadow:
    inset 0.5px 0.5px 0px 0.5px #ffffff,
    inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000,
    0px 1px 0 0px #000000,
    1px 1px 0 0px #000000;
  user-select: none;
`;

const StyledUl = styled.ul`
  list-style: none;
  margin: 4px;
  padding: 0px;
  border: none;
  width: 200px;
  user-select: none;
`;

const Seperator = styled.li`
  border-top: 1px solid white;
  border-bottom: 1px solid black;
`;

const StyledLi = styled.li`
  font-size: 22px;
  cursor: pointer;
  user-select: none;
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
  user-select: none;
`;

const Icon = styled.div<{ $active: boolean }>`
  width: 64px;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  color: white;
  outline-offset: -4px;
  background-color: ${(props) => (props.$active ? "rgb(0, 14, 122)" : "")};
  outline: ${(props) => (props.$active ? "white dotted 1px" : "")};
`;

enum Windows {
  Queue = 0,
  Profile = 1,
  Settings = 2,
  Chat = 3,
  Users = 4,
  Leaderboard = 5,
}

const Taskbar: React.FC = () => {
  const [displayChat, setDisplayChat] = useState<boolean>(false);
  const [displayUsers, setDisplayUsers] = useState<boolean>(false);
  const [displayStart, setDisplayStart] = useState<boolean>(false);
  const [displayQueue, setDisplayQueue] = useState<boolean>(false);
  const [displayLeaderboard, setDisplayLeaderboard] = useState<boolean>(false);
  const [displayProfile, setDisplayProfile] = useState<boolean>(false);
  const [displayProfileSettings, setDisplayProfileSettings] =
    useState<boolean>(false);
  const [displayOrder, setDisplayOrder] = useState<number[]>([
    0, 10, 20, 30, 40, 50,
  ]);

  function changeOrder(pos: number) {
    setDisplayOrder([
      pos === Windows.Queue ? 50 : displayOrder[Windows.Queue] - 10,
      pos === Windows.Profile ? 50 : displayOrder[Windows.Profile] - 10,
      pos === Windows.Settings ? 50 : displayOrder[Windows.Settings] - 10,
      pos === Windows.Chat ? 50 : displayOrder[Windows.Chat] - 10,
      pos === Windows.Users ? 50 : displayOrder[Windows.Users] - 10,
      pos === Windows.Leaderboard ? 50 : displayOrder[Windows.Leaderboard] - 10,
    ]);
  }

  return (
    <>
      <Icon
        onClick={() => setDisplayQueue(!displayQueue)}
        $active={displayQueue}
      >
        <img src={require("../../images/pong.png")} alt="pong" height="64px" />
        Pong
      </Icon>
      <a onClick={() => changeOrder(Windows.Queue)}>
        <Moveablewindow
          title="Queue"
          positionX={900}
          positionY={200}
          positionZ={displayOrder[Windows.Queue]}
          display={displayQueue}
        >
          <Queuebox />
        </Moveablewindow>
      </a>
      <a onClick={() => changeOrder(Windows.Profile)}>
        <Profilewindow
          $display={displayProfile}
          z={displayOrder[Windows.Profile]}
        />
      </a>
      <a onClick={() => changeOrder(Windows.Settings)}>
        <Profilesettings
          $display={displayProfileSettings}
          z={displayOrder[Windows.Settings]}
        />
      </a>
      <a onClick={() => changeOrder(Windows.Chat)}>
        <Chatwindow $display={displayChat} z={displayOrder[Windows.Chat]} />
      </a>
      <a onClick={() => changeOrder(Windows.Users)}>
        <Userbrowser $display={displayUsers} z={displayOrder[Windows.Users]} />
      </a>
      <a onClick={() => changeOrder(Windows.Leaderboard)}>
        <Leaderboard
          $display={displayLeaderboard}
          z={displayOrder[Windows.Leaderboard]}
        />
      </a>
      <StartMenu $display={displayStart}>
        <TextBar>Transcendence95</TextBar>
        <StyledUl>
          <StyledLi
            onClick={() => {
              setDisplayProfile(!displayProfile);
              changeOrder(Windows.Profile);
            }}
          >
            <img
              src={require("../../images/head.png")}
              height="16"
              width="16"
              alt="profile"
            />
            Profile
          </StyledLi>
          <StyledLi
            onClick={() => {
              setDisplayProfileSettings(!displayProfileSettings);
              changeOrder(Windows.Settings);
            }}
          >
            <img
              src={require("../../images/settings.png")}
              height="16"
              width="16"
              alt="profile"
            />
            Profile Settings
          </StyledLi>
          <Seperator />
          <StyledLi
            onClick={() => {
              setDisplayUsers(!displayUsers);
              changeOrder(Windows.Users);
            }}
          >
            <img
              src={require("../../images/folder_search.png")}
              height="16"
              width="16"
              alt="useres"
            />
            Users
          </StyledLi>
          <StyledLi>
            <img
              src={require("../../images/block.png")}
              height="16"
              width="16"
              alt="block"
            />
            Blocklist
          </StyledLi>
          <StyledLi>
            <img
              src={require("../../images/buddy.png")}
              height="16"
              width="16"
              alt="friend"
            />
            Friends
          </StyledLi>
          <Seperator />
          <StyledLi
            onClick={() => {
              setDisplayLeaderboard(!displayLeaderboard);
              changeOrder(Windows.Leaderboard);
            }}
          >
            <img
              src={require("../../images/book.png")}
              height="16"
              width="16"
              alt="leaderboard"
            />
            Leaderboard
          </StyledLi>
          <Seperator />
          <StyledLi>
            <img
              src={require("../../images/door.png")}
              height="16"
              width="16"
              alt="login"
            />
            Logout
          </StyledLi>
        </StyledUl>
      </StartMenu>
      <StyledNavbar>
        <TaskButton
          onClick={() => setDisplayStart(!displayStart)}
          $active={displayStart}
        >
          <img
            width="26"
            height="26"
            alt="Windows95 Logo"
            src={require("../../images/logo.png")}
          />
          Start
        </TaskButton>
        <TaskButton
          onClick={() => {
            setDisplayChat(!displayChat);
            changeOrder(Windows.Chat);
          }}
          $active={displayChat}
        >
          <img
            width="26"
            height="26"
            alt="Chat logo"
            src={require("../../images/msg.png")}
          />
          Chat
        </TaskButton>
      </StyledNavbar>
    </>
  );
};

export default Taskbar;
