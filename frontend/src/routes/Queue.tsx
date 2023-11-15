import React from "react";
import Pagetitle from "../components/pagetitle/Pagetitle";
import Queue, { EGamemode } from "../components/queuebutton/Queuebutton";
import Queuebox from "../components/queuebox";

const QueuePage: React.FC = () => {
  return (
    <>
      <Pagetitle>Queue</Pagetitle>
      <Queuebox></Queuebox>
    </>
  );
};

export default QueuePage;
