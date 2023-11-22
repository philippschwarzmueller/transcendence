import { useEffect, useState } from "react";
import { styled } from "styled-components";
import ContextMenu from "../contextmenu/ContextMenu";
import Moveablewindow from "../moveablewindow";

const Browser = styled.div`
  width: 220px;
  height: 300px;
  padding: 10px;
  margin: 0px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 17x;
    height: 17px;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    box-sizing: border-box;
    display: inline-block;
    background: rgb(195, 199, 203);
    color: rgb(0, 0, 0);
    border: 0px;
    box-shadow:
      rgb(0, 0, 0) -1px -1px 0px 0px inset,
      rgb(210, 210, 210) 1px 1px 0px 0px inset,
      rgb(134, 138, 142) -2px -2px 0px 0px inset,
      rgb(255, 255, 255) 2px 2px 0px 0px inset;
  }
`;

const StyledUl = styled.ul`
  border: none;
  margin: 0px;
  padding: 2px;
  list-style: none;
  width: 200px;
`;


const StyledLi = styled.li`
  padding: 2px 6px 2px 26px;
  border-top: 1px solid rgb(134, 138, 142);
  border-bottom: 1px solid rgb(255, 255, 255);
  &:hover {
    background-color: rgb(0, 14, 122);
    color: white;
  }
`;

interface IUserBrowser {
    $display: boolean;
  }

const Userbrowser: React.FC<IUserBrowser> = ({
    $display,
  })=> {
      let [showContext, setShowContext] = useState<boolean>(false);
      let [currentUser, setCurrentUser] = useState<string>("");
      let [x, setX] = useState<number>(0);
      let [y, setY] = useState<number>(0);
      let [users, setUsers] = useState<string[]>([]);
      let listKey = 0;

    useEffect(() => {
      fetch(`http://${window.location.hostname}:4000/users/names`, {
          method: "GET",
      }).then((response) => {
          if(!response.ok) {
              throw new Error("Network response was not ok");
          }
          return response.json();
      }).then((res: string[]) => setUsers(res));
    }, []);
    function openContextMenu(e: React.MouseEvent<HTMLLIElement, MouseEvent>, user: string) {
      setX(e.pageX);
      setY(e.pageY);
      setCurrentUser(user);
      setShowContext(!showContext);
    }

  return (
    <>
      <ContextMenu
      display={showContext}
      positionX={x}
      positionY={y}
      link={currentUser}
      isFriendIncoming={false}
      isPendingFriendIncoming={false}
      triggerReload={() => console.log()}
      />
      <Moveablewindow
      title="Browser"
      positionX={500}
      positionY={600}
      positionZ={500}
      display={$display}
      ><Browser>
      <StyledUl>
        {users.map((user) => {
          return (
          <StyledLi key={listKey} onClick={(e) => openContextMenu(e, user)}>{user}</StyledLi>
          );
        })}
      </StyledUl></Browser>
      </Moveablewindow>
    </>
  );
}

export default Userbrowser;
