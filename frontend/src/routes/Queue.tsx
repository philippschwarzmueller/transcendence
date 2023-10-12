import React from "react";
import Pagetitle from "../components/pagetitle/Pagetitle";
import Queue from "../components/queue/";

const QueuePage: React.FC = () => {
  return (
    <>
      <Pagetitle>Queue</Pagetitle>
      <Queue />
    </>
  );
};

export default QueuePage;
