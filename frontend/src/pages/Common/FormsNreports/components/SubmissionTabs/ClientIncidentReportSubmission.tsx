import React, { useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../components/child/SimpleTable";
import {
  useGetAllClientIncidentsQuery,
  type clientIncidentReport,
} from "../../../../../services/FormApi";
import ClientIncidentReportDetail from "../modals/ClientIncidentReportDetail";

interface Column {
  header: string;
  accessor: (row: clientIncidentReport) => React.ReactNode;
}

// Minimal table columns
const columns: Column[] = [
  {
    header: "Incident Date",
    accessor: (row) =>
      new Date(row.incidentDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    header: "Incident Time",
    accessor: (row) => row.incidentTime || "N/A",
  },
  {
    header: "Incident Type",
    accessor: (row) => row.incidentType || "N/A",
  },
  {
    header: "Staff Name",
    accessor: (row) => row.staffName || "N/A",
  },
  {
    header: "Actions",
    accessor: (row) => <ClientIncidentReportDetail detail={row} />,
  },
];

const ClientIncidentReportSubmission = () => {
  const [filter, setFilter] = useState({ page: 1, limit: 10, search: "" });

  const { data: incidentData, isLoading } =
    useGetAllClientIncidentsQuery(filter);

  if (isLoading) return <div>Loading...</div>;

  const submissions: clientIncidentReport[] = incidentData?.data?.data ?? [];
  const total: number = incidentData?.data?.paggination?.total || 0;

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search box */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Client Incidents"
          value={filter.search}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, search: e.target.value, page: 1 }))
          }
        />
      </div>

      {/* Table */}
      {submissions.length > 0 ? (
        <SimpleTable
          columns={columns}
          data={submissions}
          page={filter.page}
          limit={filter.limit}
          total={total}
          onPageChange={(newPage) =>
            setFilter((prev) => ({ ...prev, page: newPage }))
          }
        />
      ) : (
        <p className="text-muted">No client incident reports yet.</p>
      )}
    </div>
  );
};

export default ClientIncidentReportSubmission;
