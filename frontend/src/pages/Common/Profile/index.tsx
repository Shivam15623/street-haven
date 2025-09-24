
import StreetTab from "../../../components/StreetTab";
import SettingsTab from "./component/SettingsTab";
import PersonalInfoTab from "./component/PersonalInfoTab";

const Profile = () => {
  return (
    <div className="d-flex flex-column gap-4">
      <h2 className="text-xl text-street-dark fw-semibold mb-0">Profile</h2>
      <StreetTab
        defaultActiveKey="personal_info"
        tabs={[
          {
            key: "personal_info",
            label: "Personal Information",
            content: <PersonalInfoTab />,
          },
          { key: "settings", label: "Settings", content: <SettingsTab /> },
        ]}
      />
    </div>
  );
};

export default Profile;
