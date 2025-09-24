
import { Icon } from "@iconify/react";
import CardlistWrapper from "./CardListWrapper";

const events = [
  {
    id: 1,
    title: "All-Staff Meeting",
    date: "Friday, Dec 15",
    time: "2:00 PM",
    location: "Main Conference Room",
  },
  {
    id: 2,
    title: "Holiday Celebration",
    date: "Monday, Dec 18",
    time: "6:00 PM",
    location: "Cafeteria",
  },
  {
    id: 3,
    title: "Quarterly Review",
    date: "Wednesday, Dec 20",
    time: "10:00 AM",
    location: "Zoom Online",
  },
];

const UpcomingEvents = () => {
  return (
    <CardlistWrapper title="Upcoming Events">
      <div className="d-flex flex-column gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="d-flex flex-column justify-content-center px-8 py-10 px-sm-16 py-sm-20 border-0-5 border-sh-base rounded-2"
           
          >
            <div className="d-flex flex-column gap-2">
              {/* Title */}
              <p className="mb-0 text-street-dark text-xs xs:text-sm fw-semibold">
                {event.title}
              </p>

              {/* Date & Time */}
              <p className="d-flex flex-row text-street-base gap-2 mb-0">
                <span className="mb-0 text-xs d-flex flex-row align-items-center gap-1">
                  <Icon
                    icon="lucide:calendar"
                    className="text-street-primary"
                  />
                  {event.date}
                </span>
                <span className="mb-0 text-xs  d-flex flex-row align-items-center gap-1">
                  <Icon icon="lucide:clock" className="text-street-primary" />
                  {event.time}
                </span>
              </p>

              {/* Location */}
              <p className="mb-0 text-xs text-street-base d-flex flex-row align-items-center gap-1">
                <Icon icon="lucide:map-pin" className="text-street-primary" />
                {event.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardlistWrapper>
  );
};

export default UpcomingEvents;
