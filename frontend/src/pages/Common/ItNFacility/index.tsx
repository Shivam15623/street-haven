import StreetTab from "../../../components/StreetTab";
import SubmitRequestTab from "./components/SubmitRequestTab";
import FAQResourcesTab from "./components/FAQResourcesTab";
import TrackTickettab from "./components/TrackTickettab";
import "@assets/css/PageCss/ItFacility.css";
import TicketReport from "./components/TicketReport/TicketReport";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../redux/AuthSlice";
import LocationsTab from "./components/locations/LocationsTab";
import useHasPermission from "../../../hooks/Auth";
import { PERMISSIONS } from "../../../utills/auth/permissions";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";

const HelpDesk = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  const tabs = useMemo(
    () => [
      ...(canViewSelfTickets
        ? [
            {
              content: <SubmitRequestTab />,
              key: "submit_request",
              label: "Submit Request",
            },
            {
              content: (
                <TrackTickettab isActive={tabParam === "track_tickets"} />
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
        content: <FAQResourcesTab isActive={tabParam === "faq_resources"} />,
        key: "faq_resources",
        label: "FAQ & Resources",
      },
    ],
    [canViewSelfTickets, tabParam, hasAnyPermission, hasPermission],
  );

  const active = tabParam ?? defaultTab;

  useEffect(() => {
    // If URL has an invalid/unavailable tab, fall back to default
    const validTab = tabs.some((tab) => tab.key === active);

    if (!validTab) {
      setSearchParams(
        (prev) => {
          prev.set("tab", defaultTab);
          return prev;
        },
        { replace: true },
      );
    }
  }, [active, defaultTab, tabs, setSearchParams]);

  return (
    <div className="d-flex flex-column gap-4">
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
        onTabChange={(key) => {
          setSearchParams(
            (prev) => {
              prev.set("tab", key);
              return prev;
            },
            { replace: true },
          );
        }}
        tabs={tabs}
      />
    </div>
  );
};

export default HelpDesk;