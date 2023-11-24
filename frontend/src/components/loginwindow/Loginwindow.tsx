import { styled } from "styled-components";
import Button from "../button/Button";
import { BACKEND } from "../../routes/SetUser";

const LoginBox = styled.div`
  display: flex;
  margin: 10px;
`;

const InputFields = styled.div`
  display: flex;
  margin: 10px;
  flex-direction: column;
`;

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

const Loginwindow: React.FC = () => {
  const handleIntraLogin = async () => {
    window.location.replace(`${BACKEND}/auth/intra-login`);
  };

  return (
    <>
      <StyledWindow>
        <Windowbar>
          <img
            width="16"
            height="16"
            src={require("../../images/monitor.png")}
            alt="Monitor"
          />
          Welcome to Trancendence95
        </Windowbar>
        <LoginBox>
          <img
            src={require("../../images/key.png")}
            alt="keys"
            width="64px"
            height="64px"
          />
          <InputFields>
            <p style={{ cursor: "default" }}>Just press the button to log in</p>
            <Button onClick={() => handleIntraLogin()}>Ok</Button>
          </InputFields>
        </LoginBox>
      </StyledWindow>
    </>
  );
};

export default Loginwindow;
