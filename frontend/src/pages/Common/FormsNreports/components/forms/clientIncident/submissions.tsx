import React, { useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../../components/child/SimpleTable";
import {
  useDeleteClientIncidentMutation,
  useGetAllClientIncidentsQuery,
  type clientIncidentReport,
} from "../../../../../../services/FormApi";

import EditClientIncident from "./edit";
import ClientIncidentReportDetail from "./detail";
import DeleteConfirmModal from "../delete";

interface Column {
  header: string;
  accessor: (row: clientIncidentReport) => React.ReactNode;
}

const ClientIncidentReportSubmission = () => {
  const [filter, setFilter] = useState({ page: 1, limit: 10, search: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteclientIncident, { isLoading: deleting }] =
    useDeleteClientIncidentMutation();
  const { data: incidentData, isLoading } =
    useGetAllClientIncidentsQuery(filter);

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
      accessor: (row) => (
        <div className="d-flex gap-2">
          <EditClientIncident data={row} />
          <ClientIncidentReportDetail incident={row} />
          <button
            className="btn btn-sm btn-street-delete d-flex flex-row align-items-center justify-content-center radius-12 text-md"
            onClick={() => handleDeleteClick(row._id)}
          >
            <Icon icon="mdi:delete" className="text-xl" />
          </button>
        </div>
      ),
    },
  ];

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
      {/* 🗑️ Delete Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Employee Incident Report"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />

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
