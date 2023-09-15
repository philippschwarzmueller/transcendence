import React from "react";
import Button from "../components/button";
import Form from "../components/form";
import Input from "../components/input";

const lastMatches: string[] = [
  "Win against A",
  "Win against A",
  "Loss against A",
];
const onlineFriends: string[] = ["pschwarz", "mgraefen"];

const Home: React.FC = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          height: "95vh",
          backgroundColor: "rgb(85, 170, 170)",
        }}
      >
        <h1>Welcome to WinPong</h1>
        <Form>
          <Input label="username" type="text"></Input>
          <Input label="password" type="password"></Input>
          <Button>Create Account</Button>
        </Form>
        <div>
          <div>
            <h2>Quickplay</h2>
            <Button>Search match</Button>
          </div>
          <div>
            <h2>Last matches</h2>
            <ul>
              {lastMatches.map((match: string) => {
                return <li>{match}</li>;
              })}
            </ul>
          </div>
          <div>
            <h2>Online Friends</h2>
            <ul>
              {onlineFriends.map((friend: string) => {
                return <li>{friend}</li>;
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
