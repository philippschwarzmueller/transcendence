import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 400;
  height: 400;
  border: 2px solid black;
`;

interface SpectatorboardProps {
  intraname?: string;
}

const Spectatorboard: React.FC<SpectatorboardProps> = (
  props: SpectatorboardProps
) => {
  return (
    <>
      <Wrapper>
        <p>jo</p>
      </Wrapper>
    </>
  );
};

export default Spectatorboard;
