import styled from "styled-components";

const Gamecanvas = styled.canvas`
  background-color: rgba(0, 0, 0, 0);
  border: 3px solid #000000;
  position: absolute;
  transform: translate(-50%, 0);
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "100%"};
`;

export default Gamecanvas;
