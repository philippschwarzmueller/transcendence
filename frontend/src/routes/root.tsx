import React from "react";
import { Outlet } from "react-router-dom";

const Root: React.FC = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default Root;
