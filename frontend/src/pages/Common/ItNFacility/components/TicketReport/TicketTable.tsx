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
  overview?: string; // optional: used to prefill the modals if the report API returns it
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

const OverviewField: React.FC<{
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ id, value, onChange, disabled }) => (
  <div className="mt-3">
    <label className="form-label text-xs fw-semibold" htmlFor={id}>
      Update / Overview <span className="fw-normal text-muted">(optional)</span>
    </label>
    <textarea
      id={id}
      className="form-control"
      rows={4}
      maxLength={2000}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add a short update for everyone following this ticket"
      disabled={disabled}
    />
  </div>
);

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
  const [reopenOverview, setReopenOverview] = useState("");
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenTicket, { isLoading: isReopening }] = useReopenTicketMutation();

  const [closeTargetId, setCloseTargetId] = useState<string | null>(null);
  const [closeOverview, setCloseOverview] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeTicket, { isLoading: isClosing }] = useCloseTicketMutation();

  const handleView = (id: string) => {
    setSelectedTicketId(id);
    setOpen(true);
  };

  const handleReopenClick = (row: TicketReport) => {
    setReopenTargetId(row.id);
    setReopenOverview(row.overview ?? "");
    setShowReopenModal(true);
  };

  const handleCloseClick = (row: TicketReport) => {
    setCloseTargetId(row.id);
    setCloseOverview(row.overview ?? "");
    setShowCloseModal(true);
  };

  const hideReopenModal = () => {
    if (isReopening) return;
    setShowReopenModal(false);
    setReopenTargetId(null);
    setReopenOverview("");
  };

  const hideCloseModal = () => {
    if (isClosing) return;
    setShowCloseModal(false);
    setCloseTargetId(null);
    setCloseOverview("");
  };

  const handleConfirmReopen = async () => {
    if (!reopenTargetId) return;
    try {
      const res = await reopenTicket({
        ticketId: reopenTargetId,
        overview: reopenOverview.trim(),
      }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowReopenModal(false);
        setReopenTargetId(null);
        setReopenOverview("");
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleConfirmClose = async () => {
    if (!closeTargetId) return;
    try {
      const res = await closeTicket({
        ticketId: closeTargetId,
        overview: closeOverview.trim(),
      }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowCloseModal(false);
        setCloseTargetId(null);
        setCloseOverview("");
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
                onClick={() => handleCloseClick(row)}
              >
                <Icon icon="lucide:check-check" className="w-16-px h-16-px" />
              </button>
            )}
            {REOPENABLE_STATUSES.includes(row.status) && (
              <button
                className="btn btn-street-warning btn-sm d-flex align-items-center justify-content-center"
                title="Reopen"
                aria-label="Reopen ticket"
                onClick={() => handleReopenClick(row)}
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
        onHide={hideReopenModal}
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
              onClick={hideReopenModal}
              disabled={isReopening}
            >
              Cancel
            </button>
          </div>
        }
      >
        <p className="mb-0">
          Are you sure you want to reopen this ticket? Completed and Closed
          tickets move back to <strong>Approved</strong> and are sent to the
          assignee again. Rejected tickets move back to <strong>Open</strong>{" "}
          and need approval again.
        </p>
        <OverviewField
          id="reopen-overview"
          value={reopenOverview}
          onChange={setReopenOverview}
          disabled={isReopening}
        />
      </ModalWrapper>

      {/* Close modal */}
      <ModalWrapper
        show={showCloseModal}
        onHide={hideCloseModal}
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
              onClick={hideCloseModal}
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
        <OverviewField
          id="close-overview"
          value={closeOverview}
          onChange={setCloseOverview}
          disabled={isClosing}
        />
      </ModalWrapper>
    </>
  );
};

export default TicketReportTable;
