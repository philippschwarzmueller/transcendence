import { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
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

const StyledLabel = styled.label`
`;

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement>{
  label?: string;
}

const Input: React.FC<IInputProps> = ({label, ...inherited}) => {
  return (
    <div>
      <StyledLabel htmlFor={label}>{label}</StyledLabel>
      <StyledInput id={label} {...inherited}></StyledInput>
    </div>
  )
}

export default Input;
