import React from "react";
import { Outlet, Link } from "react-router-dom";

const Root: React.FC = () => {
  return (
    <>
      <nav style={{ width: "100%" }}>
        <ul style={{ listStyle: "none", display: "inline-flex" }}>
          <li style={{ padding: 10 }}>
            <Link to={"/home"}>Home</Link>
          </li>
          <li style={{ padding: 10 }}>
            <Link to={"/react-basics"}>React basics</Link>
          </li>
          <li style={{ padding: 10 }}>
            <Link to={"/congrats"}>Congrats</Link>
          </li>
        </ul>
      </nav>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Root;
