import StreetTab from "../../../components/StreetTab";
import CollectiveAgreementTab from "./component/CollectiveAgreementTab";
import OrganizationalChartTab from "./component/OrganizationalChartTab";
import TownhallMinutesTab from "./component/TownhallMinutesTab";
import "@assets/css/PageCss/orgchart.css";
import HrUpdatesTab from "./component/HrUpdatesTab";
import { useSearchParams } from "react-router-dom";
import AnnouncementTab from "./component/AnnouncementTab";
const AgencyInfo = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "collective_agreement";

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
        defaultActiveKey={tabParam}
        tabs={[
          {
            key: "collective_agreement",
            label: "Collective Agreement",
            content: <CollectiveAgreementTab />,
          },
          {
            key: "event_minutes",
            label: "Event Minutes",
            content: <TownhallMinutesTab />,
          },
          {
            key: "organizational_chart",
            label: "Organizational Chart",
            content: <OrganizationalChartTab />,
          },
          {
            key: "hr_updates",
            label: "HR updates",
            content: <HrUpdatesTab />,
          },
          {
            key: "announcements",
            label: "Announcement",
            content: <AnnouncementTab />,
          },
        ]}
      />
    </div>
  );
};

export default AgencyInfo;
