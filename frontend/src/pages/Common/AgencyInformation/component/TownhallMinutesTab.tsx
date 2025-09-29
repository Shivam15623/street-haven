import { useState } from "react";
import useHasPermission from "../../../../hooks/Auth";
import { useFetchMeetingMinutesQuery } from "../../../../services/meetingminutesApi";
import ActionstownhallMinutes from "./ActionstownhallMinutes";
import TownhallMinuteCard from "./TownhallMinuteCard";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const TownhallMinutesTab = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const pageSize = 10;
  const [searchParams] = useSearchParams();
  const slugParam = searchParams.get("slug") ?? "";
  const { data, isLoading, isError, error } = useFetchMeetingMinutesQuery({
    page: 1,
    limit: 10,
    slug: slugParam,
    sortBy: "meetingDate",
    order: "desc",
  });
  const totalPages = data
    ? Math.ceil(data.data.paggination.totalPages / pageSize)
    : 0;

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setPage(pageNumber);
  };
  const { isAdmin } = useHasPermission();
  return (
    <div className="d-flex flex-column gap-24">
      {/* Add Button */}
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">Townhall Minutes</h2>{" "}
        {isAdmin && (
          <button
            className="btn btn-street-primary"
            onClick={() => setShowModal(true)}
          >
            Add Meeting Minute
          </button>
        )}
      </div>
      {isAdmin && (
        <ActionstownhallMinutes
          onHide={() => setShowModal(false)}
          show={showModal}
        />
      )}

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
        <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
          {/* First page */}
          <li className="page-item">
            <Link className="page-link" to="#" onClick={() => goToPage(1)}>
              <Icon icon="ep:d-arrow-left" className="text-xl" />
            </Link>
          </li>

          {/* Previous page */}
          <li className="page-item">
            <Link
              className="page-link"
              to="#"
              onClick={() => goToPage(page - 1)}
            >
              <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
            </Link>
          </li>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p} className="page-item">
              <Link
                className={`page-link ${
                  page === p
                    ? "bg-primary-600 text-white"
                    : "bg-primary-50 text-secondary-light"
                }`}
                to="#"
                onClick={() => goToPage(p)}
              >
                {p}
              </Link>
            </li>
          ))}

          {/* Next page */}
          <li className="page-item">
            <Link
              className="page-link"
              to="#"
              onClick={() => goToPage(page + 1)}
            >
              <Icon icon="iconamoon:arrow-right-2-light" className="text-xxl" />
            </Link>
          </li>

          {/* Last page */}
          <li className="page-item">
            <Link
              className="page-link"
              to="#"
              onClick={() => goToPage(totalPages)}
            >
              <Icon icon="ep:d-arrow-right" className="text-xl" />
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default TownhallMinutesTab;
