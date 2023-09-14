import React from "react";
import { useState, useEffect } from "react";
import Button from "../components/button";
import Input from "../components/input";

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
        <Input value={counter} disabled style={{width: "20px"}}></Input>
        <Button
          style={{ height: 40, width: 80 }}
          onClick={() => setCounter(counter + 1)}
        >
          Increment
        </Button>
        <h1>{welcomeMessage}</h1>
        <Button onClick={() => window.alert("hello")}>say hello</Button>
        <Input
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
        ></Input>
      </div>
    </>
  );
};

export default Home;
