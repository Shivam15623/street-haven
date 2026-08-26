import React, { useMemo, useState } from "react";

import TicketDetailDrawer from "./TicketDetailDrawer";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import type { Column } from "../../../../../components/child/SimpleTable";
import SimpleTable from "../../../../../components/child/SimpleTable";
import type { BadgeVariant } from "../../../../../components/child/Badge";
import Badge from "../../../../../components/child/Badge";
import { useReopenTicketMutation } from "../../../../../services/ticketApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import { getErrorMessage } from "../../../../../utills/utills";

export interface TicketReport {
  id: string;
  slug: string;
  ticketId: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  location: string;
  submittedBy: string;
  assignedTo: string;
  approvedBy: string;
  created: string;
  resolved: string | null;
}
const statusVariant: Record<string, BadgeVariant> = {
  Open: "warning-soft",
  Approved: "info-soft",
  "In Progress": "orange-soft",
  Completed: "success-soft",
  Rejected: "danger-soft",
  Closed: "secondary-soft",
};

// Keep in sync with backend REOPENABLE_STATUSES
const REOPENABLE_STATUSES = ["Completed", "Rejected", "Closed"];

interface Props {
  tickets: TicketReport[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

const TicketReportTable: React.FC<Props> = ({
  tickets,
  page,
  limit,
  total,
  onPageChange,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [reopenTargetId, setReopenTargetId] = useState<string | null>(null);
  const [showReopenModal, setShowReopenModal] = useState(false);

  const [reopenTicket, { isLoading: isReopening }] = useReopenTicketMutation();

  const handleView = (id: string) => {
    setSelectedTicketId(id);
    setOpen(true);
  };

  const handleReopenClick = (id: string) => {
    setReopenTargetId(id);
    setShowReopenModal(true);
  };

  const handleConfirmReopen = async () => {
    if (!reopenTargetId) return;
    try {
      const res = await reopenTicket(reopenTargetId).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowReopenModal(false);
        setReopenTargetId(null);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const columns: Column<TicketReport>[] = useMemo(
    () => [
      {
        header: "#",
        accessor: (_, index) => (page - 1) * limit + index + 1,
      },
      {
        header: "Ticket ID",
        accessor: (row) => row.ticketId,
      },
      {
        header: "Title",
        accessor: (row) => row.title,
      },
      {
        header: "Status",
        accessor: (row) => (
          <Badge variant={statusVariant[row.status] ?? "secondary-soft"}>
            {row.status}
          </Badge>
        ),
      },
      {
        header: "Priority",
        accessor: (row) =>
          row.priority === "-" ? (
            "--"
          ) : (
            <Badge
              variant={
                row.priority === "High"
                  ? "danger-soft"
                  : row.priority === "Medium"
                    ? "warning-soft"
                    : "success-soft"
              }
            >
              {row.priority}
            </Badge>
          ),
      },
      {
        header: "Category",
        accessor: (row) => row.category,
      },
      {
        header: "Location",
        accessor: (row) => row.location,
      },
      {
        header: "Submitted By",
        accessor: (row) => row.submittedBy,
      },
      {
        header: "Assigned To",
        accessor: (row) => row.assignedTo ?? "--",
      },
      {
        header: "Approved By",
        accessor: (row) => row.approvedBy ?? "--",
      },
      {
        header: "Created",
        accessor: (row) => new Date(row.created).toLocaleDateString(),
      },
      {
        header: "Resolved",
        accessor: (row) =>
          row.resolved ? new Date(row.resolved).toLocaleDateString() : "-",
      },
      {
        header: "Action",
        accessor: (row) => (
          <div className="d-flex gap-2">
            <button
              className="btn btn-street-primary btn-sm"
              onClick={() => handleView(row.id)}
            >
              View
            </button>
            {REOPENABLE_STATUSES.includes(row.status) && (
              <button
                className="btn btn-street-neutral btn-sm"
                onClick={() => handleReopenClick(row.id)}
              >
                Reopen
              </button>
            )}
          </div>
        ),
      },
    ],
    [page, limit],
  );

  return (
    <>
      <SimpleTable
        columns={columns}
        data={tickets}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
      />

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        open={open}
        onClose={() => setOpen(false)}
      />

      <ModalWrapper
        show={showReopenModal}
        onHide={() => {
          if (!isReopening) {
            setShowReopenModal(false);
            setReopenTargetId(null);
          }
        }}
        title="Reopen Ticket"
        size="md"
        isLoading={isReopening}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-street-primary btn-sm"
              onClick={handleConfirmReopen}
              disabled={isReopening}
            >
              {isReopening ? "Reopening..." : "Reopen"}
            </button>
            <button
              className="btn btn-street-neutral btn-sm"
              onClick={() => {
                setShowReopenModal(false);
                setReopenTargetId(null);
              }}
              disabled={isReopening}
            >
              Cancel
            </button>
          </div>
        }
      >
        <p className="mb-0">
          Are you sure you want to reopen this ticket? It will move back to{" "}
          <strong>Open</strong> status and re-enter the approval flow.
        </p>
      </ModalWrapper>
    </>
  );
};

export default TicketReportTable;
