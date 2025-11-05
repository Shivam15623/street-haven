import React from "react";
import { useFetchEventsPastQuery } from "../../../../services/EventApi";
import EventCard from "./EventCard";

const PastEvents = () => {
  const { data: pastEvents, isFetching } = useFetchEventsPastQuery({
    page: 1,
    limit: 10,
    slug: "",
    order: "desc",
  });
  return (
    <div className="d-flex flex-column gap-16">
      {pastEvents?.data.events.length === 0 && !isFetching && (
        <div className="text-center text-sm text-street-base">
          No upcoming events
        </div>
      )}
      {pastEvents?.data.events.map((event) => (
        <EventCard event={event} />
      ))}
      
    </div>
  );
};

export default PastEvents;
