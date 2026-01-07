import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

import SimpleTable from "../../../../../../components/child/SimpleTable";
import {
  useDeleteClientFeedbackMutation,
  useLazyGetAllClientFeedbackQuery,
  type clientFeedbackData,
} from "../../../../../../services/FormApi";

import EditClientFeedback from "./edit";
import ClientFeedback from "./details";
import DeleteConfirmModal from "../delete";
import { useDebounce } from "../../../../../../hooks/useDebounce";
import type { AgentTabProp } from "../../../../AgencyInformation/component/Agreement/CollectiveAgreementTab";
import dayjs from "dayjs";
import TablePlaceholderLoader from "../../../../../../components/child/SimpleTablePlaceHolder";

interface Column {
  header: string;
  accessor: (row: clientFeedbackData) => React.ReactNode;
}

// Define table columns

const ClientFeedbackSubmission: React.FC<AgentTabProp> = ({ isActive }) => {
  const [filter, setFilter] = useState({ page: 1, limit: 10, search: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(filter.search, 1000);
  const [deleteclientFeedback, { isLoading: deleting }] =
    useDeleteClientFeedbackMutation();
  const [getClientfeedback, { data: feedbackData, isLoading }] =
    useLazyGetAllClientFeedbackQuery();

  useEffect(() => {
    if (isActive) {
      getClientfeedback({
        page: filter.page,
        limit: filter.limit,
        search: debouncedSearch,
      });
    }
  }, [isActive, getClientfeedback, filter.page, filter.limit, debouncedSearch]);
  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteclientFeedback({ id: selectedId }).unwrap();
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const columns: Column[] = [
    {
      header: "Visit Date",
      accessor: (row) => dayjs(row.visitDate).format("DD MMM YYYY"),
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
        <div className="d-flex gap-2">
          <EditClientFeedback data={row} />
          <ClientFeedback detail={row} />
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
      {/* 🗑️ Delete Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Client Feedback"
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
        <p className="text-muted">No client feedback submissions yet.</p>
      )}
    </div>
  );
};

export default ClientFeedbackSubmission;
