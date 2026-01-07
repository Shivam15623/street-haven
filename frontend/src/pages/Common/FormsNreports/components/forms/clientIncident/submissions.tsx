import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../../components/child/SimpleTable";
import {
  useDeleteClientIncidentMutation,
  useLazyGetAllClientIncidentsQuery,
  type clientIncidentReport,
} from "../../../../../../services/FormApi";

import EditClientIncident from "./edit";
import ClientIncidentReportDetail from "./detail";
import DeleteConfirmModal from "../delete";
import { useDebounce } from "../../../../../../hooks/useDebounce";
import type { AgentTabProp } from "../../../../AgencyInformation/component/Agreement/CollectiveAgreementTab";
import dayjs from "dayjs";
import { formatTime12Hour } from "../../../../../../utills/utills";
import TablePlaceholderLoader from "../../../../../../components/child/SimpleTablePlaceHolder";
import useHasPermission from "../../../../../../hooks/Auth";

interface Column {
  header: string;
  accessor: (row: clientIncidentReport) => React.ReactNode;
}

const ClientIncidentReportSubmission: React.FC<AgentTabProp> = ({
  isActive,
}) => {
  const [filter, setFilter] = useState({ page: 1, limit: 10, search: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(filter.search, 1000);
  const [deleteclientIncident, { isLoading: deleting }] =
    useDeleteClientIncidentMutation();
  const [getClientIncident, { data: incidentData, isLoading }] =
    useLazyGetAllClientIncidentsQuery();
  const { hasPermission } = useHasPermission();
  useEffect(() => {
    if (isActive) {
      getClientIncident({
        page: filter.page,
        limit: filter.limit,
        search: debouncedSearch,
      });
    }
  }, [isActive, getClientIncident, filter.page, filter.limit, debouncedSearch]);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteclientIncident({ id: selectedId }).unwrap();
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // Minimal table columns
  const columns: Column[] = [
    {
      header: "Incident Date",
      accessor: (row) => dayjs(row.incidentDate).format("DD MMM YYYY"),
    },
    {
      header: "Incident Time",
      accessor: (row) => formatTime12Hour(row.incidentTime) || "N/A",
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
      accessor: (row) => (
        <div className="d-flex gap-2">
          {hasPermission({ action: "edit_form" }) && (
            <EditClientIncident data={row} />
          )}

          <ClientIncidentReportDetail incident={row} />
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
      {/* 🗑️ Delete Modal */}
         {hasPermission({ action: "edit_form" }) && (
      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Employee Incident Report"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />)}

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
