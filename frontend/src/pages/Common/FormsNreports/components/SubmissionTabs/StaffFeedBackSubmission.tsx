import React, { useState } from "react";
import { useViewStaffFeedBackQuery } from "../../../../../services/StaffFeedbackApi";
import type {
  IncidentReportQuery,
  StaffFeedbackData,
} from "../../../../../interfaces/incidentReport";
import { Icon } from "@iconify/react/dist/iconify.js";
import SimpleTable from "../../../../../components/child/SimpleTable";

interface Column {
  header: string;
  accessor: (row: StaffFeedbackData) => React.ReactNode;
}

// Define columns for Staff Feedback
const columns: Column[] = [
  {
    header: "Date",
    accessor: (row) =>
      new Date(row.date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    header: "Time",
    accessor: (row) =>
      new Date(row.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  { header: "Location", accessor: (row) => row.location || "N/A" },
  { header: "Category", accessor: (row) => row.category },
  { header: "Description", accessor: (row) => row.description },
  {
    header: "Witnesses",
    accessor: (row) =>
      Array.isArray(row.witnesses) && row.witnesses.length > 0
        ? row.witnesses.join(", ")
        : "None",
  },
  { header: "Actions Taken", accessor: (row) => row.actionsTaken || "None" },
  { header: "Reporter Name", accessor: (row) => row.reporterName || "Anonymous" },
  {
    header: "Submitted By",
    accessor: (row) =>
      `${row.submittedBy?.firstname || "Unknown"} (${row.submittedBy?.email || "N/A"})`,
  },
];


// Staff Feedback Component using table
const StaffFeedBackSubmission = () => {
  const [filter, setFilter] = useState<IncidentReportQuery>({
    page: 1,
    limit: 10,
    order: "desc",
    search: "",
  });

  const { data: feedBackSubmissions, isLoading } = useViewStaffFeedBackQuery(filter);
  console.log(feedBackSubmissions)

  if (isLoading) return <div>Loading...</div>;

  const submissions: StaffFeedbackData[] =
    feedBackSubmissions?.data?.allfeedbackSubmissions ?? [];
  const total: number = feedBackSubmissions?.data?.paggination?.total || 0;

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search box */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Feedback"
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
          page={filter.page!}
          limit={filter.limit!}
          total={total}
          onPageChange={(newPage) => setFilter((prev) => ({ ...prev, page: newPage }))}
        />
      ) : (
        <p className="text-muted">No feedback submissions yet.</p>
      )}
    </div>
  );
};

export default StaffFeedBackSubmission;