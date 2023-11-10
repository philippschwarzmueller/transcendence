import styled from "styled-components";

const Gamecanvas = styled.canvas`
  background-color: rgba(0, 0, 0, 0);
  position: absolute;
  transform: translate(-50%, 0);
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "100%"};
  outline: none;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
`;

export default Gamecanvas;
