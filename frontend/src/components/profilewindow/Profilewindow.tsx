import { useContext } from "react";
import { AuthContext } from "../../context/auth";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import ProfilePicture from "../profilepicture/ProfilePicture";

interface IProfileWindow {
  $display: boolean;
}

const Profilewindow: React.FC<IProfileWindow> = ({
    $display,
  }) => {
  const auth = useContext(AuthContext);

  return (
  <>
  <Moveablewindow
    title="Profile"
    display={$display}
  >
  <h1>{auth.user.name}'s Profile</h1>
  <ProfilePicture
    name={auth.user.name}
    profilePictureUrl={auth.user.profilePictureUrl}
  />
  </Moveablewindow>
  </>
  )
}

export default Profilewindow;
