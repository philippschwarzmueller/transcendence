import { useState } from "react";
import styled from "styled-components";

const StyledWindow = styled.div`
  position: absolute;
  padding: 5px;
  background-color: rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);
`;

export interface WindowProps {
  children: React.ReactNode;
}

const Windowbar = styled.div`
  height: 18px;
  margin-bottom: 2px;
  padding: 2px;
  display: flex;
  box-shadow: none;
  background: rgb(0, 14, 122);
  color: White;
  font-size: 1em;
  cursor: pointer;
`;

const Moveablewindow: React.FC<WindowProps> = (props: WindowProps) => {
  const [position, setPosition] = useState({ x: 100, y: 200 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const startDrag = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.clientX >= 0 && event.clientY >= 0) {
      setOffset({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    }
  };

  const handleDrag = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.clientX >= 0 && event.clientY >= 0) {
      setPosition({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      });
    } else {
      setPosition({
        x: position.x + offset.x,
        y: position.y + offset.y,
      });
    }
  };

  const handleDrop = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
  };

  const endDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.clientX >= 0 && event.clientY >= 0) {
      setPosition({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      });
      setOffset({
        x: 0,
        y: 0,
      });
    } else {
      setPosition({
        x: position.x + offset.x,
        y: position.y + offset.y,
      });
    }
  };

  return (
    <>
      <StyledWindow style={{ top: position.y, left: position.x }}>
        <Windowbar
          draggable={true}
          onDragStart={startDrag}
          onDrag={handleDrag}
          onDragEnd={endDrag}
          onDragOver={handleDrop}
        >
          <img
            width="16"
            height="16"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABQ0lEQVR4AcXBAW6DMBBFwedo78XezH9vtj6ZS5pURSgECoTOFN6Q1DmZpMKEsUBSd3fOMgwDEcGoA4WnGy9I6u7OWYZhICJ4xZiR1GutnCkiWGJMSOq1VlprXMVYkJkcVWultcY7xgJJHCNqZZXxVme/YIsbazofZWxWWNbZy1hT+CaJWitzpRSOMHYoJfglIHgQ0PkLYwcJaq3MlSL+ythIEpK4k8RZjM06v4KzGDtIQhJnMHbpnMVYJCD4NGNB75UrGAtaa5xNEpIYdUaSijETEXyCJCRx5+5kJqNuTEjiUyRx5+5kJj+MkaTOBdydzGTKJPVaK1eICOaMp9Ya/8E4IDPZwt1ZYsz44NxlS9ZIYovMZIkxFzw4qzKTVzITd2cLYyY9OcrdWSOJUbnxDyQxKoyMUURwFUmMCk+Fh851ChNfhxx7+xF1KZkAAAAASUVORK5CYII="
            alt="Monitor"
          ></img>
        </Windowbar>
        {props.children}
      </StyledWindow>
    </>
  );
};
export default Moveablewindow;
