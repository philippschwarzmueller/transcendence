import React from "react";
import { Outlet, Link } from "react-router-dom";

const Root: React.FC = () => {
  return (
    <>
      <nav>
        <ul>
          <li><Link to={"/react-basics"}>Home</Link></li>
          <li><Link to={"/congrats"}>Congrats</Link></li>
        </ul>
      </nav>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Root;
