import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/nav";

const Root: React.FC = () => {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
};

export default Root;
