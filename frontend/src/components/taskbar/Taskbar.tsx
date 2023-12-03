import { useContext, useState } from "react";
import { styled } from "styled-components";
import { AuthContext } from "../../context/auth";
import { BACKEND } from "../../routes/SetUser";
import Chatwindow from "../chatwindow/Chatwindow";
import Friendbrowser from "../friendbrowser/Friendbrowser";
import Leaderboard from "../leaderboard/";
import Profilesettings from "../profilesettings/Profilesettings";
import Profilewindow from "../profilewindow/Profilewindow";
import Userbrowser from "../userbrowser";
import Queuepopwindow from "../queuepopwindow/queuepopwindow";
import Spectatorboard from "../spectatorboard";
import { ProfileContext } from "../../context/profile";

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

    box-shadow: inset 0 0 0 1px rgb(134, 138, 142), 0 0 0 1px rgb(0, 0, 0);
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
  box-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
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

enum Windows {
  Profile = 0,
  Settings = 1,
  Chat = 2,
  Users = 3,
  Leaderboard = 4,
  Friends = 5,
  Queuepopwindow = 6,
  Spectatorboard = 7,
}

const Taskbar: React.FC = () => {
  let auth = useContext(AuthContext);
  const user = useContext(ProfileContext);
  const [displayChat, setDisplayChat] = useState<boolean>(false);
  const [displayUsers, setDisplayUsers] = useState<boolean>(false);
  const [displayStart, setDisplayStart] = useState<boolean>(false);
  const [displayLeaderboard, setDisplayLeaderboard] = useState<boolean>(false);
  const [displayFriends, setDisplayFriends] = useState<boolean>(false);
  const [displayProfileSettings, setDisplayProfileSettings] =
    useState<boolean>(false);
  const [displaySpectatorboard, setDisplaySpectatorboard] =
    useState<boolean>(false);
  const [displayOrder, setDisplayOrder] = useState<number[]>([
    0, 10, 20, 30, 40, 50, 60, 70,
  ]);

  const handleLogout = async () => {
    auth.logOut();
    fetch(`${BACKEND}/auth/logout`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.text())
      .catch((error) => console.error("Error:", error));
  };

  function changeOrder(pos: number) {
    setDisplayOrder([
      pos === Windows.Profile ? 70 : displayOrder[Windows.Profile] - 10,
      pos === Windows.Settings ? 70 : displayOrder[Windows.Settings] - 10,
      pos === Windows.Chat ? 70 : displayOrder[Windows.Chat] - 10,
      pos === Windows.Users ? 70 : displayOrder[Windows.Users] - 10,
      pos === Windows.Leaderboard ? 70 : displayOrder[Windows.Leaderboard] - 10,
      pos === Windows.Queuepopwindow
        ? 70
        : displayOrder[Windows.Queuepopwindow] - 10,
      pos === Windows.Friends ? 70 : displayOrder[Windows.Friends] - 10,
      pos === Windows.Spectatorboard
        ? 70
        : displayOrder[Windows.Spectatorboard] - 10,
    ]);
  }

  return (
    <>
      <div onClick={() => changeOrder(Windows.Profile)}>
        <Profilewindow
          z={displayOrder[Windows.Profile]}
        />
      </div>
      <div onClick={() => changeOrder(Windows.Friends)}>
        <Friendbrowser
          $display={displayFriends}
          z={displayOrder[Windows.Friends]}
        />
      </div>
      <div onClick={() => changeOrder(Windows.Settings)}>
        <Profilesettings
          $display={displayProfileSettings}
          z={displayOrder[Windows.Settings]}
        />
      </div>
      <div onClick={() => changeOrder(Windows.Chat)}>
        <Chatwindow $display={displayChat} z={displayOrder[Windows.Chat]} />
      </div>
      <div onClick={() => changeOrder(Windows.Users)}>
        <Userbrowser $display={displayUsers} z={displayOrder[Windows.Users]} />
      </div>
      <div onClick={() => changeOrder(Windows.Leaderboard)}>
        <Leaderboard
          $display={displayLeaderboard}
          z={displayOrder[Windows.Leaderboard]}
        />
      </div>
      <div onClick={() => changeOrder(Windows.Queuepopwindow)}>
        <Queuepopwindow></Queuepopwindow>
      </div>
      <div onClick={() => changeOrder(Windows.Spectatorboard)}>
        <Spectatorboard
          display={displaySpectatorboard}
          z={displayOrder[Windows.Spectatorboard]}
        />
      </div>
      <StartMenu $display={displayStart}>
        <TextBar>Transcendence95</TextBar>
        <StyledUl>
          <StyledLi
            onClick={() => {
              user.updateProfile(auth.user, !user.profile.display);
              changeOrder(Windows.Profile);
            }}
          >
            <img
              src={require("../../images/head.png")}
              height="16"
              width="16"
              alt="user.profile"
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
              alt="user.profile"
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
          <StyledLi
            onClick={() => {
              setDisplayFriends(!displayFriends);
              changeOrder(Windows.Friends);
            }}
          >
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
          <StyledLi
            onClick={() => {
              setDisplaySpectatorboard(!displaySpectatorboard);
              changeOrder(Windows.Spectatorboard);
            }}
          >
            <img
              src={require("../../images/joystick.png")}
              height="16"
              width="16"
              alt="running games"
            />
            Running Games
          </StyledLi>
          <Seperator />
          <StyledLi onClick={() => handleLogout()}>
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
