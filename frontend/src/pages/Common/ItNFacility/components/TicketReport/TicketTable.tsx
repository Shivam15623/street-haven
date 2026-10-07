import React, { useMemo, useState } from "react";

import TicketDetailDrawer from "./TicketDetailDrawer";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import type { Column } from "../../../../../components/child/SimpleTable";
import SimpleTable from "../../../../../components/child/SimpleTable";
import type { BadgeVariant } from "../../../../../components/child/Badge";
import Badge from "../../../../../components/child/Badge";
import {
  useCloseTicketMutation,
  useReopenTicketMutation,
} from "../../../../../services/ticketApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import { getErrorMessage } from "../../../../../utills/utills";
import { Icon } from "@iconify/react";

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
  Closed: "purple-soft",
};

// Keep in sync with backend REOPENABLE_STATUSES
const REOPENABLE_STATUSES = ["Completed", "Rejected", "Closed"];
// Keep in sync with backend closeTicket (only Completed can be closed)
const CLOSABLE_STATUSES = ["Completed"];

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

  const [closeTargetId, setCloseTargetId] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeTicket, { isLoading: isClosing }] = useCloseTicketMutation();

  const handleView = (id: string) => {
    setSelectedTicketId(id);
    setOpen(true);
  };

  const handleReopenClick = (id: string) => {
    setReopenTargetId(id);
    setShowReopenModal(true);
  };

  const handleCloseClick = (id: string) => {
    setCloseTargetId(id);
    setShowCloseModal(true);
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

  const handleConfirmClose = async () => {
    if (!closeTargetId) return;
    try {
      const res = await closeTicket(closeTargetId).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowCloseModal(false);
        setCloseTargetId(null);
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
              className="btn btn-street-primary btn-sm d-flex align-items-center justify-content-center"
              title="View"
              aria-label="View ticket"
              onClick={() => handleView(row.id)}
            >
              <Icon icon="lucide:eye" className="w-16-px h-16-px" />
            </button>
            {CLOSABLE_STATUSES.includes(row.status) && (
              <button
                className="btn btn-street-edit btn-sm d-flex align-items-center justify-content-center"
                title="Close"
                aria-label="Close ticket"
                onClick={() => handleCloseClick(row.id)}
              >
                <Icon icon="lucide:check-check" className="w-16-px h-16-px" />
              </button>
            )}
            {REOPENABLE_STATUSES.includes(row.status) && (
              <button
                className="btn btn-street-warning btn-sm d-flex align-items-center justify-content-center"
                title="Reopen"
                aria-label="Reopen ticket"
                onClick={() => handleReopenClick(row.id)}
              >
                <Icon icon="lucide:rotate-ccw" className="w-16-px h-16-px" />
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
      <SimpleTable<TicketReport>
        columns={columns}
        data={tickets}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        getRowKey={(row) => row.id}
      />

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        open={open}
        onClose={() => setOpen(false)}
      />

      {/* Reopen modal */}
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
          <strong>Approved</strong> status and be sent to the assignee again.
        </p>
      </ModalWrapper>

      {/* Close modal */}
      <ModalWrapper
        show={showCloseModal}
        onHide={() => {
          if (!isClosing) {
            setShowCloseModal(false);
            setCloseTargetId(null);
          }
        }}
        title="Close Ticket"
        size="md"
        isLoading={isClosing}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-street-primary btn-sm"
              onClick={handleConfirmClose}
              disabled={isClosing}
            >
              {isClosing ? "Closing..." : "Close Ticket"}
            </button>
            <button
              className="btn btn-street-neutral btn-sm"
              onClick={() => {
                setShowCloseModal(false);
                setCloseTargetId(null);
              }}
              disabled={isClosing}
            >
              Cancel
            </button>
          </div>
        }
      >
        <p className="mb-0">
          Confirm that the work is done and accepted? The ticket will be marked{" "}
          <strong>Closed</strong>.
        </p>
      </ModalWrapper>
    </>
  );
};

export default TicketReportTable;
