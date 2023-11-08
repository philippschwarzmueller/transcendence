import React from "react";
import Pagetitle from "../components/pagetitle/Pagetitle";
import Queue, { EGamemode } from "../components/queue/Queue";

const QueuePage: React.FC = () => {
  return (
    <>
      <Pagetitle>Queue</Pagetitle>
      <Queue gamemode={EGamemode.standard} />
      <Queue gamemode={EGamemode.roomMovement} />
    </>
  );
};

export default QueuePage;
