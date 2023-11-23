import React from "react";
import Moveablewindow from "../moveablewindow/Moveablewindow";

const Profilesettings: React.FC<{ $display: boolean; z?: number }> = ({
  $display,
  z,
}) => {
  return (
    <>
      <Moveablewindow title="Profile Settings" display={$display} positionZ={z}>
        This will be settings..
      </Moveablewindow>
    </>
  );
};

export default Profilesettings;
