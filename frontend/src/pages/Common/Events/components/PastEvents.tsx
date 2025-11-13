import { useState } from "react";
import { useFetchEventsPastQuery } from "../../../../services/EventApi";
import EventCard from "./EventCard";
import StreetPaggination from "../../../../components/child/StreetPaggination";

const PastEvents = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: pastEvents,
    isFetching,
    isError,
  } = useFetchEventsPastQuery({
    page,
    limit,
    slug: "",
    order: "desc",
  });

  const totalPages = pastEvents?.data?.paggination?.totalPages || 1;
  const events = pastEvents?.data?.events || [];

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="d-flex flex-column gap-16">
      {/* Loader */}
      {isFetching && (
        <div className="text-center text-sm text-street-base">Loading...</div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center text-sm text-danger">
          Failed to load events. Try again later.
        </div>
      )}

      {/* Empty State */}
      {!isFetching && events.length === 0 && (
        <div className="text-center text-sm text-street-base">
          No past events.
        </div>
      )}

      {/* Event List */}
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <StreetPaggination
          page={page}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PastEvents;
