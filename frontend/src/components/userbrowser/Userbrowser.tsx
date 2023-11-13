import { styled } from "styled-components";
import Moveablewindow from "../moveablewindow";

const Browser = styled.div`
  width: 220px;
  height: 300px;
  padding: 10px;
  margin: 0px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 17x;
    height: 17px;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    box-sizing: border-box;
    display: inline-block;
    background: rgb(195, 199, 203);
    color: rgb(0, 0, 0);
    border: 0px;
    box-shadow:
      rgb(0, 0, 0) -1px -1px 0px 0px inset,
      rgb(210, 210, 210) 1px 1px 0px 0px inset,
      rgb(134, 138, 142) -2px -2px 0px 0px inset,
      rgb(255, 255, 255) 2px 2px 0px 0px inset;
  }
`;

const StyledUl = styled.ul`
  border: none;
  margin: 0px;
  padding: 2px;
  list-style: none;
  width: 200px;
`;

const Seperator = styled.li`
    height: 1px;
    border-top: 1px solid rgb(134, 138, 142);
    border-bottom: 1px solid rgb(255, 255, 255);
    width: 98%;
    margin-left: 2px;
`;

const StyledLi = styled.li`
  padding: 2px 6px 2px 26px;
  &:hover {
    background-color: rgb(0, 14, 122);
    color: white;
  }
`;

interface IUserBrowser {
    display: boolean;
  }

const Userbrowser: React.FC<IUserBrowser> = ({
    display,
  })=> {

  return (
    <>
      <Moveablewindow
      title="Browser"
      positionX={500}
      positionY={600}
      positionZ={500}
      display={display}
      ><Browser><StyledUl>
      <StyledLi>user1</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user3</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user4</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user2</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user9</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user9</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user9</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user9</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user9</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user9</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user9</StyledLi>
      <Seperator></Seperator>
      <StyledLi>user9</StyledLi>
      </StyledUl></Browser></Moveablewindow>
    </>
  );
}

export default Userbrowser;
