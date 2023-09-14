import styled from 'styled-components';

export const Input = styled.input`
  outline: none;
  border: none;
  cursor: text;

  padding: 3 3 5 3;

  color: rgb(0, 0, 0);
  background-color: rgb(255, 255, 255);

  border-radius: 0;
  border-top-width: 1;
  border-top-style: 1;
  border-top-color: borderDark;

  border-right-width: 0;
  border-bottom-width: 0;

  border-left-width: 1;
  border-left-style: 1;
  border-left-color: borderDark;

  box-shadow:
    inset -1px -1px 0px 0px rgb(195, 199, 203),
    inset 1px 1px 0px 0px rgb(0, 0, 0),
    0.5px 0.5px 0px 0.5px rgb(255, 255, 255);

  -webkit-appearance: none;
`;
