import { useFetchEventsupcomingQuery } from "../../../../services/EventApi";
import EventCard from "./EventCard";

const UpcomingEvents = () => {
  const { data: upcomingEvents, isFetching } = useFetchEventsupcomingQuery({
    page: 1,
    limit: 10,
    slug: "",
    order: "desc",
  });
  return (
    <div className="d-flex flex-column gap-16">
      {upcomingEvents?.data.events.length === 0 && !isFetching && (
        <div className="text-center text-sm text-street-base">
          No upcoming events
        </div>
      )}
      {upcomingEvents?.data.events.map((event) => (
        <EventCard event={event} />
      ))}
    </div>
  );
};

export default UpcomingEvents;
