import { useContext, useEffect, useState } from "react";
import { styled } from "styled-components";
import { IProfileContext, ProfileContext } from "../../context/profile";
import Elograph from "../elograph";
import MatchHistory from "../matchhistory/Matchhistory";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import ProfilePicture from "../profilepicture/ProfilePicture";
import StatsWindow from "../stats/StatsWindow";

const UserData = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  justify-contetn: center;
`;

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
  const user: IProfileContext = useContext(ProfileContext);
  const [displayMatch, setDisplayMatch] = useState<boolean>(true);
  const [displayElo, setDisplayElo] = useState<boolean>(false);

  useEffect(() => {}, [user]);

  return (
    <>
      <Moveablewindow
        title={user.name ? user.name + "'s profile" : "profile"}
        display={$display}
        positionZ={z}
      >
        <ProfileArea>
          <UserData>
            <ProfilePicture name={user.name} />
            <StatsWindow intraname={user.intraname ? user.intraname : ""} />
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
                intraname={user.intraname ? user.intraname : ""}
                display={displayMatch}
              />
              <Elograph
                intraname={user.intraname ? user.intraname : ""}
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
