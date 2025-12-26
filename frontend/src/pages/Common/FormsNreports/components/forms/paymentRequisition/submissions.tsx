import React, { useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../../components/child/SimpleTable";
import {
  useGetAllPaymentRequisitionsQuery,
  type PaymentRequisition,
} from "../../../../../../services/FormApi";

import EditPaymentRequistion from "./edit";
import PaymentRequisitionDetail from "./detail";

interface Column {
  header: string;
  accessor: (row: PaymentRequisition) => React.ReactNode;
}

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
      </div>
    ),
  },
];

const PaymentRequistionSubmission = () => {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data, isLoading } = useGetAllPaymentRequisitionsQuery(filter);

  if (isLoading) return <div>Loading...</div>;

  const submissions: PaymentRequisition[] = data?.data?.data ?? [];
  const total: number = data?.data?.paggination?.total || 0;

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search Input */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Payment Requisitions"
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
        <p className="text-muted">No payment requisition submissions yet.</p>
      )}
    </div>
  );
};

export default PaymentRequistionSubmission;
