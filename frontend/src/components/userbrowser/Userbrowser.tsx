import { styled } from "styled-components";
import Moveablewindow from "../moveablewindow";

const Browser = styled.div`
  width: 200px;
  height: 200px;
`;

interface IUserBrowser {
    display: boolean;
  }

const Userbrowser: React.FC<IUserBrowser> = ({
    display,
  })=> {

  return (
    <>
      <Moveablewindow
      title="Browser"
      positionX={300}
      positionY={500}
      display={display}
      ><Browser></Browser></Moveablewindow>
    </>
  );
}

export default Userbrowser;
