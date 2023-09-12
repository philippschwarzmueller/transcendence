import React from 'react';
import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

const App: React.FC = () => {
  let [counter, setCounter] = useState(0);
  let [welcomeMessage, setWelcomeMessage] = useState("");
  useEffect(() => {
    fetch("http://localhost:4000").then((res) => res.text()).then((text) => setWelcomeMessage(text));
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>frontend/src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React with me
        </a>
        <span>{counter}</span>
        <button onClick={(event: any) => setCounter(counter + 1)}>Increase</button>
        <h1>{welcomeMessage}</h1>
      </header>
    </div>
  );
}

export default App;
