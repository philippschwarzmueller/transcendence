import Button from "../button";
import Centerdiv from "../centerdiv";

const queueUp = (): void => {
  alert("Now in queue");
};

const Queue: React.FC = () => {
  return (
    <>
      <Centerdiv>
        <Button onClick={queueUp}>Queue up</Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
