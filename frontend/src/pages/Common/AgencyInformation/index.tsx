import StreetTab from "../../../components/StreetTab";
import CollectiveAgreementTab from "./component/Agreement/CollectiveAgreementTab";

import TownhallMinutesTab from "./component/EventMinutes/TownhallMinutesTab";
import "@assets/css/PageCss/orgchart.css";
import HrUpdatesTab from "./component/HrUpdates/HrUpdatesTab";
import { useSearchParams } from "react-router-dom";
import AnnouncementTab from "./component/Announcements/AnnouncementTab";
import { useState } from "react";
import OrganizationalChartTab from "./component/Organizational/OrganizationalChartTab";
const AgencyInfo = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "collective_agreement";
  const [active, setActive] = useState<string>(tabParam);
  return (
    <div className="d-flex flex-column gap-4">
      {" "}
      <div className="d-flex flex-column gap-2">
        <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
          Agency Information
        </p>
        <p className="fw-normal text-sm xs:text-md">
          Access collective agreement, meeting minutes, and organizational
          structure
        </p>
      </div>
      <StreetTab
        activeKey={active}
        onTabChange={(key) => setActive(key)}
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
            key: "event_minutes",
            label: "Event Minutes",
            content: (
              <TownhallMinutesTab isActive={active === "event_minutes"} />
            ),
          },
          {
            key: "organizational_chart",
            label: "Organizational Chart",
            content: <OrganizationalChartTab />,
          },
          {
            key: "hr_updates",
            label: "HR updates",
            content: <HrUpdatesTab isActive={active === "hr_updates"} />,
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
