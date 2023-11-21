import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/auth";
import { validateToken } from "../../routes/PrivateRoute";
import { BACKEND } from "../../routes/SetUser";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import ProfilePicture from "../profilepicture/ProfilePicture";

interface IProfileWindow {
  $display: boolean;
}

const Profilewindow: React.FC<IProfileWindow> = ({
    $display,
  }) => {
  const auth = useContext(AuthContext);
  console.log(auth.user);
  return (
  <>
  <Moveablewindow
    title="Profile"
    display={$display}
  >
  <h1>{auth.user.name}'s Profile</h1>
  <p>{auth.user.profilePictureUrl}</p>
  <ProfilePicture
    name={auth.user.name}
    profilePictureUrl={auth.user.profilePictureUrl}
  />
  </Moveablewindow>
  </>
  )
}

export default Profilewindow;
