import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagetitle from "../components/pagetitle/";
import { AuthContext } from "../context/auth";
import Button from "../components/button";
import Input from "../components/input/Input";
import { BACKEND } from "./SetUser";
import { IUser } from "../context/auth";
import MatchHistory from "../components/matchhistory/Matchhistory";
import StatsWindow from "../components/stats/StatsWindow";
import GraphComponent from "../components/elograph/elograph";

const Home: React.FC = () => {
  const auth = useContext(AuthContext);
  const [validity, setValidity] = useState(false);
	const [requestedFriend, setRequestedFriend] = useState("");
  let navigate = useNavigate();

  const handleClick = async () => {
    try {
      const response = await fetch(`${BACKEND}/auth/validate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: auth.user.name,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (data == null) {
        navigate("/login");
      }
      if (auth.user.name === undefined) {
        auth.logIn({
          id: Number(data.id),
          name: data.name,
          intraname: data.intraname,
          twoFAenabled: data.twoFAenabled,
          profilePictureUrl: data.profilePictureUrl,
          activeChats: data.activeChats,
        });
      }
      setValidity(data !== null);
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  };

	const handleRequestedFriendInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setRequestedFriend(e.target.value);
  };

	const handleFriendrequest = async (): Promise<void> => {
    const response = await fetch(`${BACKEND}/users/send-friend-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
			body: JSON.stringify({ requestedFriend }),
      credentials: "include",
    });
    const success = await response.json();
    if(success){
			alert("success");
			return ;
		}
		alert("failed");
  };

	const handleGetPending = async (): Promise<void> => {
    const response = await fetch(`${BACKEND}/users/get-pending-friend-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const pendingUsers: IUser[] = await response.json();
		console.log(pendingUsers);
  };

	const handleGetReceived = async (): Promise<void> => {
    const response = await fetch(`${BACKEND}/users/get-received-friend-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const receivedUsers: IUser[] = await response.json();
		console.log(receivedUsers);
  };
	

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          height: "95vh",
        }}
      >
        <Pagetitle>Welcome to WinPong, {auth.user.name}</Pagetitle>
        <h1>Is my Session valid?</h1>
        <Button onClick={handleClick}>{validity ? "Valid" : "Invalid"}</Button>
				<Input
              label="friend request"
              placeholder="Enter name of user here"
              value={requestedFriend}
              onChange={handleRequestedFriendInputChange}
        ></Input>
				<Button onClick={handleFriendrequest}>Send Friend Request</Button>
				<Button onClick={handleGetPending}>get Pending Friend Requests</Button>
				<Button onClick={handleGetReceived}>get Received Friend Requests</Button>
        {auth?.user?.intraname ? (
          <>
            <StatsWindow intraname={auth.user.intraname}></StatsWindow>
            <MatchHistory intraname={auth.user.intraname}></MatchHistory>
            <GraphComponent intraname={auth.user.intraname}></GraphComponent>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Home;
