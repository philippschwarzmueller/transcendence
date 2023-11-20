import { styled } from "styled-components";
import Button from "../button/Button";
import Input from "../input/Input";
import Moveablewindow from "../moveablewindow/Moveablewindow";

const LoginBox = styled.div`
  display: flex;
  margin: 10px;
`;

const InputFields = styled.div`
  display: flex;
  margin: 10px;
  flex-direction: column;
`;

const Loginwindow: React.FC = () => {
  return (
    <>
      <Moveablewindow
        title="Welcome to Trancendece95"
        positionX={500}
        positionY={500}
        positionZ={100}
        display={true}
      >
        <LoginBox>
          <img src={require("../../images/key.png")} alt="keys" width="64px" height="64px" />
          <InputFields>
            <p>Just press the button to log in</p>
            <Button>Ok</Button>
          </InputFields>
        </LoginBox>
      </Moveablewindow>
    </>
  );
};

export default Loginwindow;
