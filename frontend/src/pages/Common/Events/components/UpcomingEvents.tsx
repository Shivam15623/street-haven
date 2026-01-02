import { useEffect, useState } from "react";
import StreetPaggination from "../../../../components/child/StreetPaggination";
import { useLazyFetchEventsupcomingQuery } from "../../../../services/EventApi";
import EventCard from "./EventCard";
import type { AgentTabProp } from "../../AgencyInformation/component/CollectiveAgreementTab";
import EventCardSkeleton from "./EventCardSkeleton";

const UpcomingEvents: React.FC<AgentTabProp> = ({ isActive }) => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [getupcoming, { data: upcomingEvents, isFetching, isError }] =
    useLazyFetchEventsupcomingQuery();
  useEffect(() => {
    if (isActive) {
      getupcoming({
        page: page,
        limit: limit,
        slug: "",
        order: "desc",
      });
    }
  }, [getupcoming, page, limit, isActive]);
  const totalPages = upcomingEvents?.data?.paggination?.totalPages || 1;
  const events = upcomingEvents?.data?.events || [];

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="d-flex flex-column gap-16">
      {isFetching && (
        <div className="d-flex flex-column gap-16">
          {Array.from({ length: 3 }).map((_, idx) => (
            <EventCardSkeleton key={idx} />
          ))}
        </div>
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
          No Upcoming events.
        </div>
      )}
      {events.map((event) => (
        <EventCard event={event} />
      ))}
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

export default UpcomingEvents;
