import StreetTab from "../../../components/StreetTab";
import CollectiveAgreementTab from "./component/CollectiveAgreementTab";
import OrganizationalChartTab from "./component/OrganizationalChartTab";
import TownhallMinutesTab from "./component/TownhallMinutesTab";
import "@assets/css/PageCss/orgchart.css";
import HrUpdatesTab from "./component/HrUpdatesTab";
const AgencyInfo = () => {
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
        tabs={[
          {
            key: "collective_agreement",
            label: "Collective Agreement",
            content: <CollectiveAgreementTab />,
          },
          {
            key: "townhall_minutes",
            label: "Townhall Minutes",
            content: <TownhallMinutesTab />,
          },
          {
            key: "organizational_chart",
            label: "Organizational Chart",
            content: <OrganizationalChartTab />,
          },{
            key:"hr_updates",
            label:"HR updates",
            content:<HrUpdatesTab/>
          }
        ]}
      />
    </div>
  );
};

export default AgencyInfo;
