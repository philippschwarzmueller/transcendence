import React from "react";
import Button from "../components/button";

const lastMatches: string[] = [
  "Win against A",
  "Win against A",
  "Loss against A",
];
const onlineFriends: string[] = [
  "pschwarz",
  "mgraefen"
]

const Home: React.FC = () => {
  return (
    <>
      <h1>Welcome to WinPong</h1>
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
    </>
  );
};

export default Home;
