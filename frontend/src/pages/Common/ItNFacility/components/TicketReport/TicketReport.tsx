import { useState } from "react";
import TicketFilter from "./TicketFilter";
import { useFetchTicketReportsQuery } from "../../../../../services/ticketApi";
import TicketReportTable from "./TicketTable";

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
if(isLoading){
  return<>Test</>
}

  return (
    <div className="d-flex flex-row row gap-3">
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
