import React, { useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../components/child/SimpleTable";

import {
  useGetAllMediaConsentQuery,
  type MediaConsent,
} from "../../../../../services/FormApi";

// ------------------------------
// Columns
// ------------------------------
interface Column {
  header: string;
  accessor: (row: MediaConsent) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "Name",
    accessor: (row) => row.name || "N/A",
  },
  {
    header: "Printed Name",
    accessor: (row) => row.printedname || "N/A",
  },
  {
    header: "Consent Date",
    accessor: (row) =>
      row.date ? new Date(row.date).toLocaleDateString("en-IN") : "N/A",
  },
  {
    header: "Created",
    accessor: (row) =>
      row.createdAt
        ? new Date(row.createdAt).toLocaleDateString("en-IN")
        : "N/A",
  },
];

// ------------------------------
// Component
// ------------------------------
const MediaConsentSubmission = () => {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data: consentData, isLoading } = useGetAllMediaConsentQuery(filter);

  if (isLoading) return <div>Loading...</div>;

  const submissions: MediaConsent[] = consentData?.data?.data ?? [];
  const total: number = consentData?.data?.paggination?.total || 0;

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search bar */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Media Consents"
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
        <p className="text-muted">No media consents submitted yet.</p>
      )}
    </div>
  );
};

export default MediaConsentSubmission;
