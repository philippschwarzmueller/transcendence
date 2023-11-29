import { Link } from "react-router-dom";
import Button from "../components/button/Button";
import { styled } from "styled-components";

const StyledWindow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 5px;
  background-color: rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);
`;

const Windowbar = styled.div`
  height: 18px;
  margin-bottom: 2px;
  padding: 2px;
  display: flex;
  gap: 10px;
  box-shadow: none;
  background: rgb(0, 14, 122);
  color: White;
  font-size: 1em;
  cursor: default;
`;

const NotFound: React.FC = () => {
  return (
    <>
      <StyledWindow>
        <Windowbar>
          <img
            width="16"
            height="16"
            src={require("../images/monitor.png")}
            alt="Monitor"
          />
          404
        </Windowbar>
        <h1> You seem to be lost, this button will help you. </h1>
        <Link to={"/Home"}>
          <Button>Continue</Button>
        </Link>
      </StyledWindow>
    </>
  );
};

export default NotFound;
