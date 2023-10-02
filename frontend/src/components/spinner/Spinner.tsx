import React from "react";
import { keyframes } from "styled-components";
import styled from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const StyledSpinner = styled.div`
  animation: ${rotate} 2s linear infinite;
`;

const Spinner: React.FC = () => {
  return (
    <>
      <div
        style={{
          backgroundColor: "grey",
          width: "50px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <StyledSpinner>
          <img src="/sandclock.png"></img>
        </StyledSpinner>
      </div>
    </>
  );
};

export default Spinner;
