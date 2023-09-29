import React from "react";
import { useState, useEffect } from "react";
import Button from "../components/button";
import Form from "../components/form";

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          height: "95vh",
          //backgroundColor: "rgb(85, 170, 170)",
        }}
      >
        <Form>
          <span>{counter}</span>
          <Button
            onClick={(event: React.MouseEvent) => {
              setCounter(counter + 1);
              event.preventDefault();
            }}
          >
            Increment
          </Button>
        </Form>
        <h1>{welcomeMessage}</h1>
        <Form>
          <input
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setName(event.target.value);
              event.preventDefault();
            }}
          ></input>
          <Button
            onClick={(event: React.MouseEvent) => {
              window.alert("hello");
              event.preventDefault();
            }}
          >
            say hello
          </Button>
        </Form>
      </div>
    </>
  );
};

export default App;
