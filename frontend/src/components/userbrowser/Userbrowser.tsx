import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { IUser } from "../../context/auth";
import Moveablewindow from "../moveablewindow";
import Playercard from "../playercard";

const Browser = styled.div`
  user-select: none;
  width: 300px;
  height: 400px;
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
  width: auto;
`;

const Userbrowser: React.FC<{ $display: boolean; z?: number }> = ({
  $display,
  z,
}) => {
  let [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:4000/users`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((res: IUser[]) => setUsers(res));
  }, []);

  return (
    <>
      <Moveablewindow
        title="Userbrowser"
        positionX={500}
        positionY={600}
        positionZ={z}
        display={$display}
      >
        <Browser>
          <StyledUl>
            {users.map((user) => {
              return (
                <Playercard
                  user={user}
                />
              );
            })}
          </StyledUl>
        </Browser>
      </Moveablewindow>
    </>
  );
};

export default Userbrowser;
