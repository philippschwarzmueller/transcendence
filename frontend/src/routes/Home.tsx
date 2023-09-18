import React from "react";
import { useState } from "react";
import Button from "../components/button";
import Form from "../components/form";
import Input from "../components/input";

const lastMatches: string[] = [
  "Win against A",
  "Win against A",
  "Loss against A",
];
const onlineFriends: string[] = ["pschwarz", "mgraefen"];

export interface fielddata {
  username: string | null;
  password: string | null;
}

const Home: React.FC = () => {
  let [input, setInput] = React.useState<fielddata>({
    username: "",
    password: "",
  } as fielddata);
  function inputHandler(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.id === "username") {
      setInput({ ...input, username: event.target.value });
    } else if (event.target.id === "password") {
      setInput({ ...input, password: event.target.value });
    }
  }
  let [user, setUser] = useState(null);
  function handleSubmit(event: React.MouseEvent) {
    fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
      .then((res) => res.text())
      .then((txt) => JSON.parse(txt))
      .then((obj) => {
        if (obj.username) {
          setUser(obj);
        }
        console.log(obj);
      });
    event.preventDefault();
  }
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
        {user ? <p>logged in</p> : <p>logged out</p>}
        <Form>
          <Input
            label="username"
            type="text"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              inputHandler(event)
            }
          ></Input>
          <Input
            label="password"
            type="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              inputHandler(event)
            }
          ></Input>
          <Button onClick={(event: React.MouseEvent) => handleSubmit(event)}>
            Login
          </Button>
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
