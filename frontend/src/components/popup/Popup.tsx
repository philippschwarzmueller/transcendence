import React, { useState, forwardRef, useImperativeHandle, Ref, ReactNode } from "react";
import Input from "../input/Input";
import styled from "styled-components";

const InputField = styled.div<{
  $display: boolean;
  $posX: number;
  $posY: number;
}>`
  display: ${(props) => (props.$display ? "" : "none")};
  position: absolute;
  z-index: 100;
  left: ${(props) => props.$posX + "px"};
  top: ${(props) => props.$posY + "px"};
  background-color: rgb(195, 199, 203);
  min-width: 100px;
  margin-block-start: 0px;
  margin-inline-start: 0px;
  padding-inline-start: 0px;
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 1px 0px 1px;
`;

interface props {
  onKey: (s: string) => void;
  placeholder: string;
  children: ReactNode;
}

interface refs {
  openRoom: (event: React.MouseEvent) => void;
}

function Popup({ onKey , placeholder, children }: props, ref: Ref<refs>) {
  const [input, setInput] = useState<string>("");
  let [display, setDisplay] = useState<boolean>(false);
  let [positionX, setPositionX] = useState<number>(0);
  let [positionY, setPositionY] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    openRoom,
  }));

  function openRoom(event: React.MouseEvent) {
    event.preventDefault();
    setPositionX(event.pageX);
    setPositionY(event.pageY);
    setDisplay(!display);
  }

  return (
    <>
      <InputField $display={display} $posX={positionX} $posY={positionY}>
        {children}
        <Input
          value={input}
          label="Type here"
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              onKey(input);
              setDisplay(false);
              setInput("");
            }
          }}
        ></Input>
      </InputField>
    </>
  );
}

export default forwardRef(Popup);
