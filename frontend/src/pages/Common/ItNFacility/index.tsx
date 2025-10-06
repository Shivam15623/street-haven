import StreetTab from "../../../components/StreetTab";
import SubmitRequestTab from "./components/SubmitRequestTab";
import FAQResourcesTab from "./components/FAQResourcesTab";
import TrackTickettab from "./components/TrackTickettab";
import "@assets/css/PageCss/ItFacility.css";
import { useSearchParams } from "react-router-dom";

const HelpDesk = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "submit_request";
  return (
    <div className="d-flex flex-column gap-4">
      {" "}
      <div className="d-flex flex-column gap-2">
        <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
          Facilities
        </p>
        <p className="fw-normal text-sm xs:text-md">
          Submit requests for IT support and facility maintenance
        </p>
      </div>
      <StreetTab
        defaultActiveKey={tabParam}
        tabs={[
          {
            content: <SubmitRequestTab />,
            key: "submit_request",
            label: "Submit Request",
          },
          {
            content: <TrackTickettab />,
            key: "track_tickets",
            label: "Track Tickets",
          },
          {
            content: <FAQResourcesTab />,
            key: "faq_resources",
            label: "FAQ & Resources",
          },
        ]}
      />
    </div>
  );
};

export default HelpDesk;
