import React from "react";
import styled from "styled-components";
import caret from "./downcaret.png";

const Wrapper = styled.div`
  position: relative;
  width: 200px;
  height: 22px;
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const StyledSelect = styled.select`
  position: relative;
  outline: none;
  border: 1px solid #000;
  border-radius: 0;
  width: 100%;
  height: 20px;
  padding: 2px 20px 2px 6px; /* Adjusted padding for text and caret */

  color: #000;
  background-color: #c0c0c0;
  appearance: none;
  cursor: pointer;

  &:hover {
    background-color: #a0a0a0;
  }
`;

const CaretIcon = styled.div`
  position: absolute;
  right: 6px; /* Adjusted right position */
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background-color: #c0c0c0;
  background-image: url("${caret}");
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none; /* Ensures that the caret doesn't interfere with dropdown interaction */
`;

interface DropdownItem {
  func: () => void;
  label: string;
}

interface DropdownProps {
  title: string;
  items: DropdownItem[];
}

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
    <label>
      Select your desired soring
      <Wrapper>
        <StyledSelect onChange={handleSelectChange}>
          {props.items &&
            props.items.map((item, index) => (
              <option key={index} value={item.label}>
                {item.label}
              </option>
            ))}
        </StyledSelect>
        <CaretIcon />
      </Wrapper>
    </label>
  );
};

export default Dropdown;
