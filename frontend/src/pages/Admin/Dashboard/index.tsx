import { Col, Row } from "react-bootstrap";
import DashboardCard from "../../Employee/Dashboard/components/DashboardCard";
import RecentActivity from "../../Employee/Dashboard/components/RecentActivity";
import UpcomingEvents from "../../Employee/Dashboard/components/UpcomingEvents";
import dayjs from "dayjs";
import "@assets/css/PageCss/dashboard.css";
import { selectAuth } from "../../../redux/AuthSlice";
import { useSelector } from "react-redux";
import { useFetchEventsupcomingQuery } from "../../../services/EventApi";
const AdminDashboard = () => {
  const today = dayjs().format("dddd, MMMM D, YYYY");
  const { user } = useSelector(selectAuth);

  const { data, isLoading } = useFetchEventsupcomingQuery({
    limit: 5,
    order: "desc",
    page: 1,
  });
  return (
    <div className="d-flex flex-column gap-4 ">
      <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
        <div className="d-flex flex-column gap-1 gap-sm-2">
          <div className="fw-semibold text-lg xs:text-xl sm:text-xxl text-street-dark">
            Welcome Back,{user?.firstName}!
          </div>
          <div className="text-street-base text-xs xs:text-sm sm:text-md fw-normal">
            Here's what's happening at Street Haven today.
          </div>
        </div>
        <div className="d-flex flex-sm-column flex-row justify-content-sm-end justify-content-start gap-1 gap-sm-2 ">
          <div className="text-street-base text-xs xs:text-sm sm:text-md fw-normal text-end">
            Today
          </div>
          <div className="fw-semibold text-sm xs:text-md sm:text-lg text-end text-street-dark">
            {today}
          </div>
        </div>
      </div>
      <Row className=" g-2 g-md-4">
        <Col xs={6} sm={6} md={3}>
          <div
            onClick={() =>
              window.open(
                "https://streethaven.sharepoint.com/SitePages/Index.aspx",
                "_blank"
              )
            }
            className=" h-80-px h-sm-100-px cursor-pointer h-md-144-px w-100 radius-12 p-md-24 d-flex fw-bold text-md sm:text-lg md:text-xl flex-row justify-content-center align-items-center link-card text-white"
          >
            Staff Portal
          </div>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <div
            onClick={() =>
              window.open(
                "https://outlook.office.com/owa/?realm=streethaven.com",
                "_blank"
              )
            }
            className="link-card h-80-px cursor-pointer h-sm-100-px h-md-144-px w-100 radius-12 p-md-24 d-flex fw-bold text-md sm:text-lg md:text-xl flex-row justify-content-center align-items-center bg-street-primary text-white"
          >
            SH Webmail
          </div>
        </Col>
        <Col xs={12} sm={12} md={3}>
          <div
            onClick={() =>
              window.open(
                "https://streethaven.sharepoint.com/sites/StreetHaven/Staff%20Schedules/Forms/AllItems.aspx",
                "_blank"
              )
            }
            className="link-card h-80-px cursor-pointer h-sm-100-px h-md-144-px w-100 radius-12 p-md-24 d-flex fw-bold text-md sm:text-lg md:text-xl flex-row justify-content-center align-items-center bg-street-primary text-white"
          >
            Staff Schedules
          </div>
        </Col>
        <Col xs={12} sm={12} md={3}>
          <div
            // onClick={() =>
            //   window.open(
            //     "https://streethaven.sharepoint.com/sites/StreetHaven/Staff%20Schedules/Forms/AllItems.aspx",
            //     "_blank"
            //   )
            // }
            className="link-card h-80-px cursor-pointer h-sm-100-px h-md-144-px w-100 radius-12 p-md-24 d-flex fw-bold text-md sm:text-lg md:text-xl flex-row justify-content-center align-items-center bg-street-primary text-white"
          >
            CMS
          </div>
        </Col>
      </Row>

      <Row className=" g-2 g-md-3 g-lg-4">
        <DashboardCard
          icon="lucide:calendar"
          label="Events"
          value={data?.data.events.length ?? 0}
          key={"Events"}
          link={`/events`}
        />

        <DashboardCard
          icon="iconamoon:ticket-light"
          label="Open Tickets"
          link={`/it_facility?tab=track_tickets&status=Open`}
          value={8}
          key={"Open Tickets"}
        />
        <DashboardCard
          icon="lucide:party-popper"
          label="Announcements"
          value={3}
          link={`/agency_info?tab=announcements`}
          key={"Announcements"}
        />
      </Row>
      <Row className="g-4">
        <Col md={6}>
          {" "}
          <RecentActivity />
        </Col>
        <Col md={6}>
          <UpcomingEvents
            events={data?.data.events ?? []}
            loading={isLoading}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
