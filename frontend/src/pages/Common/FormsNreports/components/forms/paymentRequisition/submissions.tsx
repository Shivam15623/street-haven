import React, { useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../../components/child/SimpleTable";
import {
  useDeletePaymentRequistionMutation,
  useGetAllPaymentRequisitionsQuery,
  type PaymentRequisition,
} from "../../../../../../services/FormApi";

import EditPaymentRequistion from "./edit";
import PaymentRequisitionDetail from "./detail";
import DeleteConfirmModal from "../delete";
import { useDebounce } from "../../../../../../hooks/useDebounce";

interface Column {
  header: string;
  accessor: (row: PaymentRequisition) => React.ReactNode;
}

const PaymentRequistionSubmission = () => {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  // 🔹 Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(filter.search, 1000);
  const { data, isLoading } = useGetAllPaymentRequisitionsQuery({
    page: filter.page,
    limit: filter.limit,
    search: debouncedSearch,
  });
  const [deletePaymentReqistion, { isLoading: deleting }] =
    useDeletePaymentRequistionMutation();

  const submissions: PaymentRequisition[] = data?.data?.data ?? [];
  const total: number = data?.data?.paggination?.total || 0;

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deletePaymentReqistion({ id: selectedId }).unwrap();
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const columns: Column[] = [
    {
      header: "Requested Date",
      accessor: (row) =>
        new Date(row.requestedDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      header: "Requested By",
      accessor: (row) => row.requestedBy,
    },
    {
      header: "Payee",
      accessor: (row) => row.payeeName,
    },
    {
      header: "Total Amount",
      accessor: (row) => `$${row.totalAmount}`,
    },
    {
      header: "Approved By",
      accessor: (row) => row.approvedBy,
    },
    {
      header: "Action",
      accessor: (row) => (
        <div className="d-flex gap-2">
          <EditPaymentRequistion data={row} />
          <PaymentRequisitionDetail detail={row} />
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

  return (
    <div className="d-flex flex-column gap-24">
      {/* 🔍 Search */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Payment Requisitions"
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
      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Payment Requisition"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />

      {/* 📋 Table */}
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
        <p className="text-muted">No payment requisition submissions yet.</p>
      )}
    </div>
  );
};

export default PaymentRequistionSubmission;
