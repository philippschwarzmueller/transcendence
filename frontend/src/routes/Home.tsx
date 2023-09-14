import React from "react";
import { useState, useEffect } from "react";
import Button from "../components/button";

const Home: React.FC = () => {
  let [counter, setCounter] = useState(0);
  let [welcomeMessage, setWelcomeMessage] = useState("");
  let [name, setName] = useState("");
  useEffect(() => {
    fetch(`http://localhost:4000/hello/${name}`)
      .then((res) => res.text())
      .then((text) => setWelcomeMessage(text));
  }, [name]);
  return (
    <>
      <h1>We home man</h1>
      <div>
        <span>{counter}</span>
        <Button
          style={{ height: 40, width: 80 }}
          onClick={() => setCounter(counter + 1)}
        >
          Increment
        </Button>
        <h1>{welcomeMessage}</h1>
        <Button onClick={() => window.alert("hello")}>say hello</Button>
        <input
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
        ></input>
      </div>
    </>
  );
};

export default Home;
