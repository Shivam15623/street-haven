import { useEffect, useMemo, useState } from "react";

import {

  useLazyFetchMeetingMinutesQuery,
} from "../../../../services/meetingminutesApi";
import ActionstownhallMinutes from "./ActionstownhallMinutes";
import TownhallMinuteCard from "./TownhallMinuteCard";
import { useSearchParams } from "react-router-dom";

import StreetPaggination from "../../../../components/child/StreetPaggination";
import useHasPermission from "../../../../hooks/Auth";
import type { AgentTabProp } from "./CollectiveAgreementTab";

const TownhallMinutesTab: React.FC<AgentTabProp> = ({ isActive }) => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const [searchParams] = useSearchParams();
  const slugParam = useMemo(
    () => searchParams.get("slug") ?? "",
    [searchParams]
  );
  const [getEventMinutes, { data, isLoading, isError, error }] =
    useLazyFetchMeetingMinutesQuery();
  useEffect(() => {
    if (isActive) {
      getEventMinutes({
        page: page,
        limit: 10,
        slug: slugParam,
        sortBy: "meetingDate",
        order: "desc",
      });
    }
  }, [page, slugParam, getEventMinutes, isActive]);
  const totalPages = data ? data.data.paggination.totalPages : 0;
  const { hasPermission } = useHasPermission();
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="d-flex flex-column gap-24">
      {/* Add Button */}
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">Event Minutes</h2>{" "}
        {hasPermission({ action: "create_event_minute" }) && (
          <button
            className="btn btn-street-primary d-flex text-sm  flex-row align-items-center justify-content-center radius-12 "
            style={{ minWidth: "43px", minHeight: "40px" }}
            onClick={() => setShowModal(true)}
          >
            Add Event Minute
          </button>
        )}
      </div>
      {
        <ActionstownhallMinutes
          onHide={() => setShowModal(false)}
          show={showModal}
        />
      }

      {/* Loading */}
      {isLoading && <p>Loading meeting minutes...</p>}

      {/* Error */}
      {isError && (
        <p className="text-danger">
          Failed to load meeting minutes.{" "}
          {String((error as any)?.message || "")}
        </p>
      )}

      {/* Empty state */}
      {!isLoading &&
        !isError &&
        (!data?.data?.meetingMinutes ||
          data.data.meetingMinutes.length === 0) && (
          <p className="text-muted">No meeting minutes found.</p>
        )}

      {/* Render Cards */}
      {data?.data?.meetingMinutes?.map((meeting) => (
        <TownhallMinuteCard meeting={meeting} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <StreetPaggination
          page={page}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default TownhallMinutesTab;
