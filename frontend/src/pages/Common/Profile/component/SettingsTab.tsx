import React from "react";

import ProfileSettings from "./ProfileSettings";
import ChangePassword from "./ChangePassword";

const SettingsTab = () => {
  return (
    <div className="d-flex flex-column gap-20">
      <ProfileSettings />
      <ChangePassword />
    </div>
  );
};

export default SettingsTab;
