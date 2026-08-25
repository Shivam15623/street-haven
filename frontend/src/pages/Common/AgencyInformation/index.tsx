import StreetTab from "../../../components/StreetTab";
import CollectiveAgreementTab from "./component/Agreement/CollectiveAgreementTab";



import { useNavigate, useSearchParams } from "react-router-dom";
import AnnouncementTab from "./component/Announcements/AnnouncementTab";
import { useEffect, useState } from "react";

const AgencyInfo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get("tab") ?? "collective_agreement";

  const [active, setActive] = useState<string>(tabParam);
  useEffect(() => {
    if (active !== tabParam) {
      setActive(tabParam);
    }
  }, [tabParam]);
  const handletabClick = (key: string) => {
    if (key === active) {
      return;
    }
    setActive(key);
    const params = new URLSearchParams(location.search);
    params.delete("tab");

    navigate(`${location.pathname}`, { replace: true });
  };

  return (
    <div className="d-flex flex-column gap-4">
      {" "}
      <div className="d-flex flex-column gap-2">
        <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
          Agency Information
        </p>
  
      </div>
      <StreetTab
        activeKey={active}
        onTabChange={handletabClick}
        tabs={[
          {
            key: "collective_agreement",
            label: "Collective Agreement",
            content: (
              <CollectiveAgreementTab
                isActive={active === "collective_agreement"}
              />
            ),
          },
         
         
          {
            key: "announcements",
            label: "Announcement",
            content: <AnnouncementTab isActive={active === "announcements"} />,
          },
        ]}
      />
    </div>
  );
};

export default AgencyInfo;
