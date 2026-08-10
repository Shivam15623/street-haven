import { useSearchParams } from "react-router-dom";
import StreetTab from "../../../components/StreetTab";
import SettingsTab from "./component/SettingsTab";
import PersonalInfoTab from "./component/PersonalInfoTab";
import CertificatesTab from "./component/CertificatesTab";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../redux/AuthSlice";

const VALID_TABS = ["personal_info", "training_certificate", "settings"];

const Profile = () => {
  const { user } = useSelector(selectAuth);
  const [searchParams, setSearchParams] = useSearchParams();

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

  const tabFromUrl = searchParams.get("tab");

  // fall back to first tab if the url tab is missing/invalid/not permitted (e.g. non-volunteer hitting training_certificate)
  const activeKey =
    tabFromUrl && tabs.some((t) => t.key === tabFromUrl)
      ? tabFromUrl
      : tabs[0].key;

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key }, { replace: true });
  };

  return (
    <div className="d-flex flex-column gap-4">
      <h2 className="text-xl text-street-dark fw-semibold mb-0">Profile</h2>

      <StreetTab
        tabs={tabs}
        activeKey={activeKey}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default Profile;
