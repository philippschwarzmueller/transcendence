import { forwardRef, Ref, useImperativeHandle, useState } from "react";
import { styled } from "styled-components";

const StyledDiv = styled.div<{
  $display: boolean;
  $posX: number;
  $posY: number;
}>`
  padding: 4px;
  left: ${(props) => props.$posX + "px"};
  top: ${(props) => props.$posY + "px"};
  display: ${(props) => (props.$display ? "flex" : "none")};
  background: white;
  z-index:400;
`;


interface props {
  title: string;
}

interface refs {
    openBrowser: (event: React.MouseEvent) => void;
  }

function ChannelUser({ title }: props, ref: Ref<refs>) {
  const [display, setDisplay] = useState<boolean>(false);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    openBrowser,
  }));

  function openBrowser(event: React.MouseEvent) {
    setPositionX(event.pageX);
    setPositionY(event.pageY);
    setDisplay(!display);
  }

  return (
    <>
      <StyledDiv
        $display={display}
        $posX={positionX}
        $posY={positionY}
      >
        {title}
      </StyledDiv>
    </>
  );
}

export default forwardRef(ChannelUser);
