import React, { ReactNode } from "react";
import styled from "styled-components";

const StyledWindow = styled.div`
  position: relative;
  border: 1px solid #808080; /* Grey outline */
  border-radius: 1px;
  padding: 5px;
  margin: 5px;
  padding-top: 10px;
  padding-left: 15px;
  padding-right: 15px;
  box-shadow: 1px 1px 0px inset white, 1px 1px 0px white;
  display: inline-block;
`;

const Title = styled.div`
  font-size: 14px;
  color: #000;
  position: absolute;
  bottom: 35px;
  padding-left: 3px;
  padding-right: 3px;
  padding-bottom: 3px;
  background-color: rgb(195, 199, 203);
`;

interface WindowWrapperProps {
  title: string;
  children: ReactNode;
}

const WindowWrapper: React.FC<WindowWrapperProps> = ({ title, children }) => {
  return (
    <StyledWindow>
      <Title>{title}</Title>
      {children}
    </StyledWindow>
  );
};

export default WindowWrapper;
