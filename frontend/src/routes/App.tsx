import React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import Button from "../components/button";
import Navbar from "../components/nav";

const App: React.FC = () => {
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
      <Navbar />
      <div className="App">
        <header className="App-header">
          <a
            className="App-link"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React with me
          </a>
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
        </header>
      </div>
    </>
  );
};

export default App;
