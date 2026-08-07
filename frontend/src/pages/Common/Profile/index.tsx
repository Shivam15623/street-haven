import StreetTab from "../../../components/StreetTab";
import SettingsTab from "./component/SettingsTab";
import PersonalInfoTab from "./component/PersonalInfoTab";
import CertificatesTab from "./component/CertificatesTab";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../redux/AuthSlice";

const Profile = () => {
  const { user } = useSelector(selectAuth);

  const tabs = [
    {
      key: "personal_info",
      label: "Personal Information",
      content: <PersonalInfoTab />,
    },
    ...(user?.role === "volunteer"
      ? [
          {
            key: "training_certificate",
            label: "Training Certificate",
            content: <CertificatesTab />,
          },
        ]
      : []),
    {
      key: "settings",
      label: "Settings",
      content: <SettingsTab />,
    },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      <h2 className="text-xl text-street-dark fw-semibold mb-0">Profile</h2>

      <StreetTab
        defaultActiveKey="personal_info"
        tabs={tabs}
      />
    </div>
  );
};

export default Profile;