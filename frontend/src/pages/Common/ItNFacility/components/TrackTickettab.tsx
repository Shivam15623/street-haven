import { useState } from "react";
import TicketCard from "./TicketCard";
import { TicketCountCard } from "./TicketCountCard";
import type { TicketFetchQuery } from "../../../../interfaces/Ticket";
import { useFetchTicketsQuery } from "../../../../services/ticketApi";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const TrackTickettab = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status") ?? "All";
  // Filter state (page included here)
  const [filter, setFilter] = useState<TicketFetchQuery>({
    page: 1,
    priority: "All",
    status: statusParam as
      | "Open"
      | "In Progress"
      | "Under Review"
      | "Completed"
      | "All",
    limit: 10,
    order: "desc",
    search: "",
  });

  // Fetch tickets with filter
  const { data: ticketData, isLoading } = useFetchTicketsQuery(filter);

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
              <div className="card h-100 ticket-card">
                <div className="card-body d-flex flex-row ticket-card h-100 align-items-center justify-content-between p-16 p-sm-24">
                  {/* Count + Label */}
                  <div className="d-flex flex-column gap-1 w-50">
                    <div className="placeholder-glow">
                      <span className="placeholder col-6 mb-1"></span>
                    </div>
                    <div className="placeholder-glow">
                      <span className="placeholder col-8"></span>
                    </div>
                  </div>

                  {/* Icon placeholder */}
                  <div
                    className="placeholder-glow d-flex align-items-center justify-content-center rounded-circle bg-light"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <span className="placeholder col-6"></span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <TicketCountCard
              count={ticketData?.data.counts.open ?? 0}
              label="Open"
              variant="open"
              onClick={() => {
                setFilter((prev) => ({ ...prev, status: "Open", page: 1 }));
              }}
              active={filter.status === "Open"}
            />
            <TicketCountCard
              count={ticketData?.data.counts.inProgress ?? 0}
              label="In Progress"
              variant="progress"
              icon="lucide:clock"
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  status: "In Progress",
                  page: 1,
                }))
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
                setFilter((prev) => ({
                  ...prev,
                  status: "Under Review",
                  page: 1,
                }))
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
            <div className="card" key={i}>
              <div
                className="card-body p-16 p-md-24 d-flex flex-column gap-2 gap-md-3"
                style={{ boxShadow: "0px 0px 10px 0px #00000012" }}
              >
                {/* Title + Badges */}
                <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-10">
                  <div className="placeholder-glow w-50">
                    <span className="placeholder col-8"></span>
                  </div>
                  <div className="d-flex flex-row gap-10">
                    <span className="placeholder col-2 rounded-pill"></span>
                    <span className="placeholder col-2 rounded-pill"></span>
                  </div>
                </div>

                {/* Description */}
                <div className="placeholder-glow">
                  <span className="placeholder col-12"></span>
                  <span className="placeholder col-10"></span>
                </div>

                {/* Meta info */}
                <div className="text-xs d-flex flex-column flex-md-row gap-1 gap-md-3 fw-normal">
                  <span className="placeholder col-3"></span>
                  <span className="placeholder col-2"></span>
                  <span className="placeholder col-3"></span>
                </div>

                <hr />

                {/* Footer Section */}
                <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
                  <div className="row gy-2 gx-3 w-auto align-items-sm-center">
                    <div className="col-6 col-sm-auto placeholder-glow">
                      <span className="placeholder col-6"></span>
                    </div>
                    <div className="col-6 col-sm-auto placeholder-glow">
                      <span className="placeholder col-6"></span>
                    </div>
                    <div className="col-6 col-sm-auto d-flex align-items-center gap-2">
                      <Icon
                        icon="lucide:paperclip"
                        className="text-muted w-16-px h-16-px"
                      />
                      <span className="placeholder col-4"></span>
                    </div>
                  </div>
                  <div className="d-flex flex flex-row gap-2">
                    <span className="placeholder rounded col-2"></span>
                    <span className="placeholder rounded col-2"></span>
                  </div>
                </div>
              </div>
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
