import StreetTab from "../../../../components/StreetTab";
import UpcomingEvents from "./UpcomingEvents";
import PastEvents from "./PastEvents";

const EventListView = () => {
  return (
    <div className="card">
      <div className="card-body  p-16 p-sm-20 radius-12 p-md-24">
        <div className="d-flex flex-column gap-16">
          <StreetTab
            tabs={[
              {
                label: "Upcoming Events",
                content: <UpcomingEvents />,
                key: "upcoming_events",
              },
              {
                label: "Past Events",
                content: <PastEvents />,
                key: "past_events",
              },
            ]}
            defaultActiveKey="upcoming_events"
          />
        </div>
      </div>
    </div>
  );
};

export default EventListView;
