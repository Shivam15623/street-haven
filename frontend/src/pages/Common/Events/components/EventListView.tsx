import { useFetchEventsupcomingQuery } from "../../../../services/EventApi";
import EventCard from "./EventCard";

const EventListView = () => {
  const { data: upcomingEvents, isLoading } =
    useFetchEventsupcomingQuery(undefined);
  console.log(upcomingEvents);
  return (
    <div className="card">
      <div className="card-body  p-16 p-sm-20 radius-12 p-md-24">
        <div className="d-flex flex-column gap-16">
          {upcomingEvents?.data.length === 0 && !isLoading && (
            <div className="text-center text-sm text-street-base">
              No upcoming events
            </div>
          )}
          {upcomingEvents?.data.map((event) => (
            <EventCard event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventListView;
