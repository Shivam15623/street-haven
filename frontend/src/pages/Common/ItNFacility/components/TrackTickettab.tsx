import React, { useState } from "react";
import TicketCard from "./TicketCard";
import { TicketCountCard } from "./TicketCountCard";
import type { TicketFetchQuery } from "../../../../interfaces/Ticket";
import { useFetchTicketsQuery } from "../../../../services/ticketApi";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const TrackTickettab = () => {
  // Filter state (page included here)
  const [filter, setFilter] = useState<TicketFetchQuery>({
    page: 1,
    priority: "All",
    status: "All",
    limit: 10,
    order: "desc",
    search: "",
  });

  // Fetch tickets with filter
  const {
    data: ticketData,
    isLoading,
  } = useFetchTicketsQuery(filter);

  // Pagination calculation
  const total = ticketData?.data?.paggination?.total ?? 0;
  const totalPages = Math.ceil(total / filter?.limit);

  // Page navigation
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setFilter((prev) => ({ ...prev, page: pageNumber }));
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Ticket Count Cards */}
      <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-xl-3 gy-2 gx-xl-3 gx-2">
        {isLoading ? (
          // Skeleton Loader for Ticket Count Cards
          Array.from({ length: 5 }).map((_, i) => (
            <div className="col" key={i}>
              <div className="card p-3 placeholder-glow">
                <span className="placeholder col-6 mb-2"></span>
                <span className="placeholder col-4"></span>
              </div>
            </div>
          ))
        ) : (
          <>
            <TicketCountCard
              count={ticketData?.data.counts.open ?? 0}
              label="Open"
              variant="open"
              onClick={() =>
                setFilter((prev) => ({ ...prev, status: "Open", page: 1 }))
              }
              active={filter.status === "Open"}
            />
            <TicketCountCard
              count={ticketData?.data.counts.inProgress ?? 0}
              label="In Progress"
              variant="progress"
              icon="lucide:clock"
              onClick={() =>
                setFilter((prev) => ({ ...prev, status: "In Progress", page: 1 }))
              }
              active={filter.status === "In Progress"}
            />
            <TicketCountCard
              count={ticketData?.data.counts.completed ?? 0}
              label="Completed"
              variant="completed"
              icon="si:info-line"
              onClick={() =>
                setFilter((prev) => ({ ...prev, status: "Completed", page: 1 }))
              }
              active={filter.status === "Completed"}
            />
            <TicketCountCard
              count={ticketData?.data.counts.underReview ?? 0}
              label="Under Review"
              icon="solar:eye-linear"
              variant="review"
              onClick={() =>
                setFilter((prev) => ({ ...prev, status: "Under Review", page: 1 }))
              }
              active={filter.status === "Under Review"}
            />
            <TicketCountCard
              count={ticketData?.data.counts.total ?? 0}
              label="Total"
              variant="total"
              icon="iconamoon:ticket-light"
              onClick={() =>
                setFilter((prev) => ({ ...prev, status: "All", page: 1 }))
              }
              active={filter.status === "All"}
            />
          </>
        )}
      </div>

      {/* Render Ticket Cards dynamically */}
      {isLoading ? (
        <div className="d-flex flex-column gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-3 placeholder-glow">
              <span className="placeholder col-7 mb-2"></span>
              <span className="placeholder col-4 mb-2"></span>
              <span className="placeholder col-10"></span>
            </div>
          ))}
        </div>
      ) : (
        ticketData?.data.tickets.map((ticket) => (
          <TicketCard ticket={ticket} key={ticket._id} />
        ))
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
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
              onClick={() => goToPage(filter.page - 1)}
            >
              <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
            </Link>
          </li>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p} className="page-item">
              <Link
                className={`page-link ${
                  filter.page === p
                    ? "bg-primary text-white"
                    : "bg-light text-secondary"
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
              onClick={() => goToPage(filter.page + 1)}
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

export default TrackTickettab;
