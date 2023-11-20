import React, { useState } from "react";
import styled from "styled-components";

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 16px; /* Add margin for spacing between title and button */
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
`;

const Button = styled.button`
  background-color: #c0c0c0;
  color: #000;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
`;

interface MenuProps {
  open: boolean;
}

const Menu = styled.ul<MenuProps>`
  position: absolute;
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  background-color: #ffffff;
  border: 1px solid #000;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  z-index: 1;
  display: ${(props) => (props.open ? "block" : "none")};
`;

const MenuItem = styled.li`
  padding: 8px 16px;
  cursor: pointer;
  &:hover {
    background-color: #094c4c;
  }
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
  const [open, setOpen] = useState<boolean>(false);

  // Get the last label from the items array
  const [lastLabel, setLastLabel] = useState<string>(props.items[0].label);

  return (
    <DropdownWrapper>
      <Title>{props.title}</Title>
      <Button
        onClick={() => {
          setOpen(!open);
        }}
      >
        {lastLabel}
      </Button>
      <Menu open={open}>
        {props.items.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.func();
              setLastLabel(item.label);
              setOpen(false);
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </DropdownWrapper>
  );
};

export default Dropdown;
