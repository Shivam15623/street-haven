import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../../components/child/SimpleTable";
import {
  useDeleteEmployeeIncidentMutation,
  useLazyGetAllEmployeeIncidentsQuery,
  type EmployeeIncidentReportPopulated,
} from "../../../../../../services/FormApi";

import EditEmployeeIncident from "./edit";
import EmployeeIncidentReportDetails from "./details";
import DeleteConfirmModal from "../delete";
import { useDebounce } from "../../../../../../hooks/useDebounce";
import type { AgentTabProp } from "../../../../AgencyInformation/component/Agreement/CollectiveAgreementTab";
import dayjs from "dayjs";
import TablePlaceholderLoader from "../../../../../../components/child/SimpleTablePlaceHolder";
import useHasPermission from "../../../../../../hooks/Auth";

interface Column {
  header: string;
  accessor: (row: EmployeeIncidentReportPopulated) => React.ReactNode;
}

// Minimal columns for table view

const EmployeeIncidentReportSubmission: React.FC<AgentTabProp> = ({
  isActive,
}) => {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    search: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(filter.search, 1000);
  const [getEmployeeIncident, { data: incidentData, isLoading }] =
    useLazyGetAllEmployeeIncidentsQuery();
  const { hasPermission } = useHasPermission();
  useEffect(() => {
    if (isActive) {
      getEmployeeIncident({
        page: filter.page,
        limit: filter.limit,
        search: debouncedSearch,
      });
    }
  }, [
    isActive,
    getEmployeeIncident,
    filter.page,
    filter.limit,
    debouncedSearch,
  ]);
  const [deletEmployeeIncident, { isLoading: deleting }] =
    useDeleteEmployeeIncidentMutation();

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deletEmployeeIncident({ id: selectedId }).unwrap();
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const columns: Column[] = [
    {
      header: "Name",
      accessor: (row) => (
        <div>
          {row.employee.firstname} {row.employee.lastname}
        </div>
      ),
    },
    {
      header: "Job Title",
      accessor: (row) => row.jobTitle || "N/A",
    },
    {
      header: "Injury Date",
      accessor: (row) => dayjs(row.injuryDate).format("DD MMM YYYY"),
    },
    {
      header: "Location",
      accessor: (row) => row.location || "N/A",
    },
    {
      header: "Supervisor",
      accessor: (row) => (
        <div>
          {row.supervisor.firstname} {row.supervisor.lastname}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="d-flex gap-2">
          {hasPermission({ action: "edit_form" }) && (
            <EditEmployeeIncident data={row} />
          )}
          <EmployeeIncidentReportDetails detail={row} />
          {hasPermission({ action: "delete_form" }) && (
            <button
              className="btn btn-sm btn-street-delete d-flex flex-row align-items-center justify-content-center radius-12 text-md"
              onClick={() => handleDeleteClick(row._id)}
            >
              <Icon icon="mdi:delete" className="text-xl" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="d-flex flex-column gap-24">
        {/* Search placeholder */}
        <div className="px-20 py-16 bg-base radius-12 placeholder-glow">
          <span
            className="placeholder col-6 rounded"
            style={{ height: "16px" }}
          />
        </div>

        <TablePlaceholderLoader columns={6} rows={5} />
      </div>
    );
  }

  const submissions: EmployeeIncidentReportPopulated[] =
    incidentData?.data?.data ?? [];
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
      {/* 🗑️ Delete Modal */}
      {hasPermission({ action: "delete_form" }) && (
        <DeleteConfirmModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Employee incident Report"
          isLoading={deleting}
          onConfirm={handleConfirmDelete}
        />
      )}

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
