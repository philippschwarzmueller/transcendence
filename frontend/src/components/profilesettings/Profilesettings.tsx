import React from "react";
import Moveablewindow from "../moveablewindow/Moveablewindow";

const Profilesettings: React.FC<{$display: boolean}> = ( { $display }) => {
    return (
      <>
        <Moveablewindow
          title="Profile Settings"
          display={ $display }
        >
          This will be settings..
        </Moveablewindow>
      </>
    )
}

export default Profilesettings;
