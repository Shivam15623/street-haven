import React, { useState } from "react";
import { Icon } from "@iconify/react";

import SimpleTable from "../../../../../../components/child/SimpleTable";
import {
  useGetAllClientFeedbackQuery,
  type clientFeedbackData,
} from "../../../../../../services/FormApi";

import EditClientFeedback from "./edit";
import ClientFeedback from "./details";

interface Column {
  header: string;
  accessor: (row: clientFeedbackData) => React.ReactNode;
}

// Define table columns
const columns: Column[] = [
  {
    header: "Visit Date",
    accessor: (row) =>
      new Date(row.visitDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    header: "Visit Location",
    accessor: (row) => row.visitLocation || "N/A",
  },
  {
    header: "Client Name",
    accessor: (row) => row.clientName || "Anonymous",
  },
  {
    header: "Client Email",
    accessor: (row) => row.clientEmail || "N/A",
  },

  {
    header: "Complaint Nature",
    accessor: (row) => {
      if (row.complaintNature === "Other") {
        return row.otherComplaintText;
      }

      return row.complaintNature;
    },
  },
  {
    header: "Actions",
    accessor: (row) => (
      <>
        <EditClientFeedback data={row} />
        <ClientFeedback detail={row} />
      </>
    ),
  },
];

const ClientFeedbackSubmission = () => {
  const [filter, setFilter] = useState({ page: 1, limit: 10, search: "" });

  const { data: feedbackData, isLoading } =
    useGetAllClientFeedbackQuery(filter);

  if (isLoading) return <div>Loading...</div>;

  const submissions: clientFeedbackData[] =
    feedbackData?.data?.allfeedbackSubmissions ?? [];
  const total: number = feedbackData?.data?.paggination?.total || 0;

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search box */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Client Feedback"
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
        <p className="text-muted">No client feedback submissions yet.</p>
      )}
    </div>
  );
};

export default ClientFeedbackSubmission;
