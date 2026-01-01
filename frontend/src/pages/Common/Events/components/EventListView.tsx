import StreetTab from "../../../../components/StreetTab";
import UpcomingEvents from "./UpcomingEvents";
import PastEvents from "./PastEvents";
import { useState } from "react";

const EventListView = () => {
  const [active, setActive] = useState<string>("upcoming_events");
  return (
    <div className="card">
      <div className="card-body  p-16 p-sm-20 radius-12 p-md-24">
        <div className="d-flex flex-column gap-16">
          <StreetTab
            onTabChange={(key) => setActive(key)}
            tabs={[
              {
                label: "Upcoming Events",
                content: (
                  <UpcomingEvents isActive={active === "upcoming_events"} />
                ),
                key: "upcoming_events",
              },
              {
                label: "Past Events",
                content: <PastEvents isActive={active === "past_events"} />,
                key: "past_events",
              },
            ]}
            activeKey={active}
          />
        </div>
      </div>
    </div>
  );
};

export default EventListView;
