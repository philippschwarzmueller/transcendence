import React, { forwardRef } from "react";
import styled, { css } from "styled-components";
import th from "styled-components";
import check from "./check.svg";

const Icon = styled.span`
  width: 12px;
  height: 12px;

  content: "";
  display: inline-block;

  position: absolute;
  left: 0;

  border-left: 1;
  border-left-color: borderDark;
  border-top: 1;
  border-top-color: borderDark;

  box-shadow: 1px 1px 1px 1px;

  background-color: white;

  background-repeat: no-repeat;
  background-position: center center;
  background-size: 7px 7px;
`;
const Text = styled.span`
  padding: 5px;
  user-select: none;
`;

const Field = styled.input.attrs({
  type: "checkbox",
})`
  width: 12px;
  height: 12px;

  margin: 0;

  position: relative;
  top: 0;
  left: 0;

  opacity: 0;

  &:checked + ${Icon} {
    background-image: url("${check}");
  }
`;

export type LabelProps = {
  disabled?: boolean;
};

const Label = styled.label<LabelProps>`
  display: inline - block;
  position: relative;
  margin: 8 0;
  padding-left: 20;
  height: 15px;
  line-height: -1.5;
`;

export type CheckboxProps = {
  label?: string;
  checked?: boolean;
  onChange?: () => void;
};

const Checkbox: React.FC<CheckboxProps> = (props) => {
  return (
    <>
      <Label>
        <Field checked={props.checked} onChange={props.onChange} />
        <Icon />
        <Text>{props.label}</Text>
      </Label>
    </>
  );
};

export default Checkbox;
