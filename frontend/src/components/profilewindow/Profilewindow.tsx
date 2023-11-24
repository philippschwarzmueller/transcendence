import { useContext, useState } from "react";
import { styled } from "styled-components";
import { AuthContext } from "../../context/auth";
import Elograph from "../elograph";
import MatchHistory from "../matchhistory/Matchhistory";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import ProfilePicture from "../profilepicture/ProfilePicture";
import StatsWindow from "../stats/StatsWindow";

const UserData = styled.div``;

const Tabbar = styled.ul`
  height: 24px;
  width: auto;
  display: flex;
  padding: 0px;
  margin: 0px;
  border: none;
  box-shadow: none;
  background-color: unset;
`;
const Filler = styled.div`
  border-bottom: white solid 1px;
  width: 60%;
`;

const Tab = styled.li<{ $active: boolean }>`
  list-style: none;
  display: list-item;
  width: 20%;
  padding: 5px;
  font-size: 14px;
  border: solid 1px;
  border-top-color: white;
  border-left-color: white;
  border-top-left-radius: 5px 5px;
  border-top-right-radius: 5px 5px;
  cursor: pointer;
  background-color: ${(props) =>
    props.$active ? "rgb(195, 199, 203)" : "rgb(180, 180, 190)"};
  border-bottom-color: ${(props) =>
    props.$active ? "rgb(195, 199, 203)" : "white"};
`;

const Tabcontent = styled.div`
  padding: 5px;
  border: solid 1px;
  border-top: none;
  border-left-color: white;
  width: 500px;
  height: 94%;
`;

const Tabs = styled.div`
  padding: 5px;
`;

const ProfileArea = styled.div`
  padding: 5px;
  display: flex;
`;

const Profilewindow: React.FC<{ $display: boolean; z?: number }> = ({
  $display,
  z,
}) => {
  const auth = useContext(AuthContext);
  const [displayMatch, setDisplayMatch] = useState<boolean>(true);
  const [displayElo, setDisplayElo] = useState<boolean>(false);
  return (
    <>
      <Moveablewindow
        title={auth.user.name ? auth.user.name + "'s profile" : "profile"}
        display={$display}
        positionZ={z}
      >
        <ProfileArea>
          <UserData>
            <ProfilePicture
              name={auth.user.name}
              profilePictureUrl={auth.user.profilePictureUrl}
            />
            <StatsWindow intraname={auth.user.name ? auth.user.name : ""} />
          </UserData>
          <Tabs>
            <Tabbar>
              <Tab
                $active={displayMatch}
                onClick={() => {
                  setDisplayMatch(true);
                  setDisplayElo(false);
                }}
              >
                Match History
              </Tab>
              <Tab
                $active={displayElo}
                onClick={() => {
                  setDisplayElo(true);
                  setDisplayMatch(false);
                }}
              >
                Elo History
              </Tab>
              <Filler />
            </Tabbar>
            <Tabcontent>
              <MatchHistory
                intraname={auth.user.name ? auth.user.name : ""}
                display={displayMatch}
              />
              <Elograph
                intraname={auth.user.name ? auth.user.name : ""}
                display={displayElo}
              />
            </Tabcontent>
          </Tabs>
        </ProfileArea>
      </Moveablewindow>
    </>
  );
};

export default Profilewindow;
