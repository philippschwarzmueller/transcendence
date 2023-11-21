import React, { forwardRef } from "react";
import styled from "styled-components";

import caret from "./downcaret.png";

const Wrapper = styled.div`
  position: relative;
  width: 200px;
  height: 20px;
`;

const Select = styled.select`
  position: relative;
  outline: none;
  border: none;
  border-radius: 0;
  width: 100%;
  height: 20px;
  padding: 3px;

  color: #000;
  background-color: white;

  border-left: 1px solid #000;
  border-top: 1px solid #000;

  box-shadow: inset -1px -1px 0 0 #808080, inset 1px 1px 0 0 #000,
    0.5px 0.5px 0 0.5px #fff;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
`;

const CaretWrapper = styled.div`
  position: absolute;
  right: -1%;
  top: 9%;
  width: 20px;
  height: 100%;
  pointer-events: none;

  &:after {
    display: flex;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 14px;
    line-height: 1.1;
    content: "";
    pointer-events: none;

    background-color: #c0c0c0;
    box-shadow: inset 0.5px 0.7px 0px 0.7px #808080, inset -1px 0px 0 1px #000,
      inset 1.5px 1.5px 0px 1.5px #fff;

    border-right: 1;
    border-bottom: 1;

    background-image: url("${caret}");
    background-position: 60% 60%;
    background-repeat: no-repeat;
  }
`;

const StyledOption = styled.option`
  color: red;
  background-color: red;
  border-radius: 15px;
`;

type DropdownItem = {
  func: () => void;
  label: string;
};

type DropdownProps = {
  title: string;
  items: DropdownItem[];
};

const Dropdown: React.FC<DropdownProps> = (props) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedItem = props.items.find(
      (item) => item.label === event.target.value
    );
    if (selectedItem) {
      selectedItem.func();
    }
  };

  return (
    <Wrapper>
      <Select onChange={handleSelectChange}>
        {props.items &&
          props.items.map((item, index) => (
            <StyledOption key={index} value={item.label}>
              {item.label}
            </StyledOption>
          ))}
      </Select>
      <CaretWrapper />
    </Wrapper>
  );
};

export default Dropdown;
