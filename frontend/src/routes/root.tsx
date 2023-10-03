import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/nav";
import GlobalStyle from "./GlobalStyle";

const Root: React.FC = () => {
  return (
    <>
		<GlobalStyle/>
      <Nav />
      <Outlet />
    </>
  );
};

export default Root;
