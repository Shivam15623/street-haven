import { useState } from "react";
import TicketFilter from "./TicketFilter";
import {
  useExportTicketReportMutation,
  useFetchTicketReportsQuery,
} from "../../../../../services/ticketApi";
import TicketReportTable from "./TicketTable";
import { TicketCountCard } from "../TicketCountCard";


export type TicketStatus =
  | "Open"
  | "Approved"
  | "In Progress"
  | "Completed"
  | "Rejected"
  | "Closed";
export interface ticketsReportFilters {
  startDate: string;
  endDate: string;

  // Ticket filters
  location: string;
  status:
    | "All"
    | "Open"
    | "Approved"
    | "In Progress"
    | "Completed"
    | "Rejected"
    | "Closed";

  // User filters
  createdBy: string;
  assignedTo: string;
  approvedBy: string;

  // Pagination
  page: number;
  limit: number;
}

const TicketReport = () => {
  const [filters, setFilters] = useState<ticketsReportFilters>({
    startDate: "",
    endDate: "",
    location: "",
    status: "All",
    createdBy: "",
    assignedTo: "",
    approvedBy: "",
    page: 1,
    limit: 20,
  });

  const { data, isLoading, isFetching, error } =
    useFetchTicketReportsQuery(filters);
  const [exportTicketReport, { isLoading: isExporting }] =
    useExportTicketReportMutation();

  const handleExport = async () => {
    try {
      const blob = await exportTicketReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        location: filters.location,
        status: filters.status,
        createdBy: filters.createdBy,
        assignedTo: filters.assignedTo,
        approvedBy: filters.approvedBy,
      }).unwrap();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tickets-report-${Date.now()}.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
    }
  };
  if (isLoading) {
    return <>Test</>;
  }

  return (
    <div className="d-flex flex-row row gap-4">
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">Ticket Reports</h2>
        <button
          className="btn btn-street-edit d-flex text-sm flex-row align-items-center p-8 px-sm-24 px-md-32  justify-content-center radius-12"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? "Exporting..." : "Export Excel"}
        </button>
      </div>

      <div className="ticket-card-grid ">
        {isLoading ? (
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
              count={data?.data.counts.open ?? 0}
              label="Open"
              variant="open"
              icon="lucide:clock-3"
              onClick={() =>
                setFilters((p) => ({ ...p, status: "Open", page: 1 }))
              }
              active={filters.status === "Open"}
            />

            <TicketCountCard
              count={data?.data.counts.approved ?? 0}
              label="Approved"
              variant="approved"
              icon="lucide:badge-check"
              onClick={() =>
                setFilters((p) => ({ ...p, status: "Approved", page: 1 }))
              }
              active={filters.status === "Approved"}
            />

            <TicketCountCard
              count={data?.data.counts.inProgress ?? 0}
              label="In Progress"
              variant="progress"
              icon="lucide:loader-circle"
              onClick={() =>
                setFilters((p) => ({ ...p, status: "In Progress", page: 1 }))
              }
              active={filters.status === "In Progress"}
            />

            <TicketCountCard
              count={data?.data.counts.completed ?? 0}
              label="Completed"
              variant="completed"
              icon="lucide:circle-check-big"
              onClick={() =>
                setFilters((p) => ({ ...p, status: "Completed", page: 1 }))
              }
              active={filters.status === "Completed"}
            />

            <TicketCountCard
              count={data?.data.counts.rejected ?? 0}
              label="Rejected"
              variant="rejected"
              icon="lucide:circle-x"
              onClick={() =>
                setFilters((p) => ({ ...p, status: "Rejected", page: 1 }))
              }
              active={filters.status === "Rejected"}
            />
          </>
        )}
      </div>

      <TicketFilter filters={filters} setFilters={setFilters} />

      {isLoading || isFetching ? <div>Loading reports...</div> : null}

      {error ? <div>Failed to load report</div> : null}

      <TicketReportTable
        tickets={data?.data?.tickets ?? []}
        page={data.data.pagination.page}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page: page }))}
        limit={20}
        total={data.data.pagination.total}
      />
    </div>
  );
};

export default TicketReport;
