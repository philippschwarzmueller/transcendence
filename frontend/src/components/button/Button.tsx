import styled from "styled-components";

const Button = styled.button`
  background-color: material;
  padding: 7 20 5;
  border: none;
  color: materialText;
  cursor: pointer;

  font-size: 12px;

  box-shadow:
    inset 1px 1px 0px 1px rgb(255, 255, 255),
    inset 0 0 0 1px rgb(134, 138, 142),
    1px 1px 0 0px rgb(0, 0, 0);

  &:disabled {
    color: materialTextDisabled;
  }

  &:focus {
    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;

    box-shadow:
      inset 1px 1px 0px 1px rgb(255, 255, 255),
      inset 0 0 0 1px rgb(134, 138, 142),
      1px 1px 0 0px rgb(0, 0, 0);
  }

  &:active {
    padding: 8 20 4;

    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;

    box-shadow:
      inset 0 0 0 1px rgb(134, 138, 142),
      0 0 0 1px rgb(0, 0, 0);
  }
`;

export default Button;
