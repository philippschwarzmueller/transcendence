import React from 'react';
import { StyledNavbar } from './style';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <StyledNavbar>
        <ul style={{ listStyle: "none", display: "inline-flex" }}>
          <li style={{ padding: 10 }}>
            <Link to={"/home"}>Home</Link>
          </li>
          <li style={{ padding: 10 }}>
            <Link to={"/react-basics"}>React basics</Link>
          </li>
          <li style={{ padding: 10 }}>
            <Link to={"/congrats"}>Congrats</Link>
          </li>
        </ul>
    </StyledNavbar>
  )
}

export default Navbar;
