import React, { useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../components/child/SimpleTable";

import {
  useGetAllFAFQuery,
  type FunctionalAbility,
} from "../../../../../services/FormApi";
import { FunctionalAbilityDetail } from "../modals/functional-abilty/FunctionalAbilty";
import EditFAbilties from "../forms/functionalAbilties/edit";

// ------------------------------
// Columns
// ------------------------------]
const statusConfig = {
  noRestrictions: {
    label: "No Restrictions",
    className: "badge bg-success-subtle text-success border border-success",
    icon: "mdi:check",
  },
  withRestrictions: {
    label: "With Restrictions",
    className: "badge bg-warning-subtle text-warning border border-warning",
    icon: "mdi:alert-circle-outline",
  },
  unable: {
    label: "Unable to Work",
    className: "badge bg-danger-subtle text-danger border border-danger",
    icon: "mdi:close",
  },
};
interface Column {
  header: string;
  accessor: (row: FunctionalAbility) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "Claim No",
    accessor: (row) => row.claimNo || "N/A",
  },
  {
    header: "Worker Name",
    accessor: (row) =>
      `${row.worker?.firstName ?? ""} ${row.worker?.lastName ?? ""}`.trim() ||
      "N/A",
  },
  {
    header: "Telephone",
    accessor: (row) => row.worker?.telephone || "N/A",
  },
  {
    header: "Accident Date",
    accessor: (row) =>
      row.dateOfAccident
        ? new Date(row.dateOfAccident).toLocaleDateString("en-IN")
        : "N/A",
  },
  {
    header: "Return Status",
    accessor: (row) => {
      const config = statusConfig[row.returnToWorkStatus];
      return (
        <span
          className={config.className + " d-inline-flex align-items-center"}
        >
          <Icon icon={config.icon} width="14" height="14" className="me-1" />
          {config.label}
        </span>
      );
    },
  },
  {
    header: "Actions",
    accessor: (row) => (
      <div className="d-flex gap-2">
        <EditFAbilties />
        <FunctionalAbilityDetail details={row} />
      </div>
    ),
  },
];

// ------------------------------
// Component
// ------------------------------
const FunctionalAbilitiesSubmission = () => {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data: abilityData, isLoading } = useGetAllFAFQuery(filter);

  if (isLoading) return <div>Loading...</div>;

  const submissions: FunctionalAbility[] = abilityData?.data?.data ?? [];
  const total: number = abilityData?.data?.paggination?.total || 0;

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search bar */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Functional Ability Reports"
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
        <p className="text-muted">
          No functional ability reports submitted yet.
        </p>
      )}
    </div>
  );
};

export default FunctionalAbilitiesSubmission;
