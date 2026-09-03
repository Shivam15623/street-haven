import StreetTab from "../../../components/StreetTab";
import SubmitRequestTab from "./components/SubmitRequestTab";
import FAQResourcesTab from "./components/FAQResourcesTab";
import TrackTickettab from "./components/TrackTickettab";
import "@assets/css/PageCss/ItFacility.css";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import TicketReport from "./components/TicketReport/TicketReport";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../redux/AuthSlice";
import LocationsTab from "./components/locations/LocationsTab";
import useHasPermission from "../../../hooks/Auth";
import { PERMISSIONS } from "../../../utills/auth/permissions";

const HelpDesk = () => {
  const [searchParams] = useSearchParams();
  const { user } = useSelector(selectAuth);
  const { hasPermission, hasAnyPermission } = useHasPermission();

  const isAdmin =
    user?.role === "super_admin" || user?.role === "volunteer_admin";

  const canViewSelfTickets = hasPermission({
    action: PERMISSIONS.TICKET_VIEW_SELF,
  });

  const defaultTab = canViewSelfTickets
    ? "submit_request"
    : isAdmin
      ? "ticket_reports"
      : "faq_resources";

  const tabParam = searchParams.get("tab");

  const [active, setActive] = useState(tabParam ?? defaultTab);
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
        activeKey={active}
        onTabChange={(key) => setActive(key)}
        tabs={[
          ...(canViewSelfTickets
            ? [
                {
                  content: <SubmitRequestTab />,
                  key: "submit_request",
                  label: "Submit Request",
                },
                {
                  content: (
                    <TrackTickettab isActive={active === "track_tickets"} />
                  ),
                  key: "track_tickets",
                  label: "Track Tickets",
                },
              ]
            : []),

          ...(hasAnyPermission([
            PERMISSIONS.TICKET_REPORT_ALL,
            PERMISSIONS.TICKET_REPORT_SELF_MANAGED,
          ])
            ? [
                {
                  content: <TicketReport />,
                  key: "ticket_reports",
                  label: "Ticket Reports",
                },
              ]
            : []),
          ...(hasPermission({ action: PERMISSIONS.LOCATION_VIEW })
            ? [
                {
                  content: <LocationsTab />,
                  key: "locations",
                  label: "Locations",
                },
              ]
            : []),

          {
            content: <FAQResourcesTab isActive={active === "faq_resources"} />,
            key: "faq_resources",
            label: "FAQ & Resources",
          },
        ]}
      />
    </div>
  );
};

export default HelpDesk;
