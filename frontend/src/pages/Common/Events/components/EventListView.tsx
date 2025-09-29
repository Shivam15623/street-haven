import { useSearchParams } from "react-router-dom";
import { useFetchEventsupcomingQuery } from "../../../../services/EventApi";
import EventCard from "./EventCard";

const EventListView = () => {
  const [searchParams] = useSearchParams();
  const slugParams = searchParams.get("slug");
  const { data: upcomingEvents, isLoading } = useFetchEventsupcomingQuery({
    page: 1,
    limit: 10,
    slug: slugParams??"",
    order: "desc",
  });
  console.log(upcomingEvents);
  return (
    <div className="card">
      <div className="card-body  p-16 p-sm-20 radius-12 p-md-24">
        <div className="d-flex flex-column gap-16">
          {upcomingEvents?.data.events.length === 0 && !isLoading && (
            <div className="text-center text-sm text-street-base">
              No upcoming events
            </div>
          )}
          {upcomingEvents?.data.events.map((event) => (
            <EventCard event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventListView;
