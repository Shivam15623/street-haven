import React, { useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../components/child/SimpleTable";
import {
  useGetAllEmployeeIncidentsQuery,
  type employeeIncidentReport,
} from "../../../../../services/FormApi";
import EmployeeIncidentReportDetails from "../modals/EmployeeIncidentReportDetails";

interface Column {
  header: string;
  accessor: (row: employeeIncidentReport) => React.ReactNode;
}

// Minimal columns for table view
const columns: Column[] = [
  {
    header: "Name",
    accessor: (row) => row.name || "N/A",
  },
  {
    header: "Job Title",
    accessor: (row) => row.jobTitle || "N/A",
  },
  {
    header: "Injury Date",
    accessor: (row) =>
      row.injuryDate
        ? new Date(row.injuryDate).toLocaleDateString("en-IN")
        : "N/A",
  },
  {
    header: "Location",
    accessor: (row) => row.location || "N/A",
  },
  {
    header: "Supervisor",
    accessor: (row) => row.supervisor || "N/A",
  },
  {
    header: "Actions",
    accessor: (row) => <EmployeeIncidentReportDetails detail={row} />,
  },
];

const EmployeeIncidentReportSubmission = () => {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data: incidentData, isLoading } =
    useGetAllEmployeeIncidentsQuery(filter);

  if (isLoading) return <div>Loading...</div>;

  const submissions: employeeIncidentReport[] = incidentData?.data?.data ?? [];
  const total: number = incidentData?.data?.paggination?.total || 0;

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search box */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Employee Incidents"
          value={filter.search}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              search: e.target.value,
              page: 1,
            }))
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
        <p className="text-muted">No employee incident reports yet.</p>
      )}
    </div>
  );
};

export default EmployeeIncidentReportSubmission;
