import React, { useState } from "react";
import { Icon } from "@iconify/react";
import CardlistWrapper from "./CardListWrapper";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../../redux/AuthSlice";
import type { EventUpcomingData } from "../../../../interfaces/EventInterfaces";
import dayjs from "dayjs";
import EventDetailspop from "./EventDetailspop";
 // ✅ import your modal component

interface UpcomingEventCardProps {
  events: EventUpcomingData[];
  loading: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventCardProps> = ({
  events,
  loading,
}) => {
  const { user } = useSelector(selectAuth);

  // 🔹 Modal state
  const [open, setOpen] = useState(false);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(
    null
  );

  const handleOpen = (slug: string) => {
    setSelectedEventSlug(slug);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEventSlug(null);
  };

  return (
    <>
      <CardlistWrapper
        title="Upcoming Events"
        viewAllLink={`/${user?.role}/events`}
      >
        <div className="d-flex flex-column gap-3">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="d-flex flex-column justify-content-center px-8 py-10 px-sm-16 py-sm-20 border-0-5 rounded-2 placeholder-glow"
                style={{
                  borderColor: "#AAAAAA",
                  minHeight: "100px",
                }}
              >
                <div className="d-flex flex-column gap-2">
                  <p className="mb-0 text-xs xs:text-sm fw-semibold">
                    <span className="placeholder col-6"></span>
                  </p>
                  <p className="d-flex flex-row gap-2 mb-0">
                    <span className="text-xs d-flex flex-row align-items-center gap-1">
                      <span className="placeholder col-4"></span>
                    </span>
                    <span className="text-xs d-flex flex-row align-items-center gap-1">
                      <span className="placeholder col-3"></span>
                      <span className="placeholder col-2"></span>
                    </span>
                  </p>
                  <p className="mb-0 text-xs d-flex flex-row align-items-center gap-1">
                    <span className="placeholder col-5"></span>
                  </p>
                </div>
              </div>
            ))}

          {!loading && events.length === 0 ? (
            <div>No Upcoming Events</div>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                onClick={() => handleOpen(event.slug)} // ✅ open modal on click
                className="cursor-pointer d-flex flex-column justify-content-center px-8 py-10 px-sm-16 py-sm-20 border-0-5 rounded-2 hover:bg-light"
                style={{
                  borderColor: "#AAAAAA",
                }}
              >
                <div className="d-flex flex-column gap-2">
                  {/* Title */}
                  <p className="mb-0 text-street-dark text-xs xs:text-sm fw-semibold">
                    {event.title}
                  </p>

                  {/* Date & Time */}
                  <p className="d-flex flex-row text-street-base gap-2 mb-0">
                    <span className="mb-0 text-xs d-flex flex-row align-items-center gap-1">
                      <Icon icon="uis:calender" className="text-street-primary" />
                      {dayjs(event.eventDate).format("MM/DD/YYYY")}
                    </span>
                    <span className="mb-0 text-xs d-flex flex-row align-items-center gap-1">
                      <Icon
                        icon="tabler:clock-filled"
                        className="text-street-primary"
                      />
                      {dayjs(event.startTime).format("hh:mm A")} -
                      {dayjs(event.endTime).format("hh:mm A")}
                    </span>
                  </p>

                  {/* Location */}
                  <a
                    href={event.location.location_url}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()} // prevent modal trigger when clicking link
                    className="mb-0 text-xs d-block text-street-base d-flex flex-row align-items-center gap-1"
                  >
                    <Icon
                      icon="icomoon-free:location"
                      className="text-street-primary"
                    />
                    {event.location.location_name}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </CardlistWrapper>

      {/* 🔹 Event Details Modal */}
      {selectedEventSlug && (
        <EventDetailspop
          eventslug={selectedEventSlug}
          open={open}
          handleClose={handleClose}
        />
      )}
    </>
  );
};

export default UpcomingEvents;
