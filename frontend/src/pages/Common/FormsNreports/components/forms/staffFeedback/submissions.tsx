import React, { useState } from "react";
import {
  useDeleteStaffReportMutation,
  useViewStaffFeedBackQuery,
} from "../../../../../../services/StaffFeedbackApi";
import type {
  IncidentReportQuery,
  StaffFeedbackData,
} from "../../../../../../interfaces/incidentReport";
import { Icon } from "@iconify/react/dist/iconify.js";
import SimpleTable from "../../../../../../components/child/SimpleTable";
import StaffFeedbackDetail from "./detail";
import EditStaffFeedback from "./edit";
import DeleteConfirmModal from "../delete";
import { useDebounce } from "../../../../../../hooks/useDebounce";

interface Column {
  header: string;
  accessor: (row: StaffFeedbackData) => React.ReactNode;
}

// Define columns for Staff Feedback

// Staff Feedback Component using table
const StaffFeedBackSubmission = () => {
  const [filter, setFilter] = useState<IncidentReportQuery>({
    page: 1,
    limit: 10,
    order: "desc",
    search: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(filter.search, 1000);
  const [deleteStaffFeedback, { isLoading: deleting }] =
    useDeleteStaffReportMutation();
  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteStaffFeedback({ id: selectedId }).unwrap();
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };
  const { data: feedBackSubmissions, isLoading } = useViewStaffFeedBackQuery({
    page: filter.page,
    limit: filter.limit,
    search: debouncedSearch,
  });
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

    {
      header: "Witnesses",
      accessor: (row) =>
        Array.isArray(row.witnesses) && row.witnesses.length > 0
          ? row.witnesses.join(", ")
          : "None",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="d-flex gap-2">
          <EditStaffFeedback data={row} />
          <StaffFeedbackDetail detail={row} />
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
      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Staff Feedback Report"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
      {/* Table */}
      {submissions.length > 0 ? (
        <SimpleTable
          columns={columns}
          data={submissions}
          page={filter.page!}
          limit={filter.limit!}
          total={total}
          onPageChange={(newPage) =>
            setFilter((prev) => ({ ...prev, page: newPage }))
          }
        />
      ) : (
        <p className="text-muted">No feedback submissions yet.</p>
      )}
    </div>
  );
};

export default StaffFeedBackSubmission;
