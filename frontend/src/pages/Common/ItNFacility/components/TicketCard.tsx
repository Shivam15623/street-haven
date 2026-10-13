// TicketCard.tsx
import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";

import TicketDetails from "./TicketEdit";
import TicketComment from "./TicketComment";
import RejectTicketModal from "./RejectTicketModal";
import ApproveTicketModal from "./ApproveTicketModal";
import DeleteTicket from "./DeleteTicket";
import Badge, { type BadgeVariant } from "../../../../components/child/Badge";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import type { TicketData } from "../../../../interfaces/Ticket";
import {
  useApproveTicketMutation,
  useCloseTicketMutation,
  useCompleteTicketMutation,
  useRejectTicketMutation,
  useReopenTicketMutation,
  useStartTicketMutation,
} from "../../../../services/ticketApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";
import { personName } from "../../../../utills/userDisplay";
import { selectAuth } from "../../../../redux/AuthSlice";
import { getTicketActions } from "../utillity/ticketPermissions";

interface TicketCardProps {
  ticket: TicketData;
}

const titleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const statusVariant: Record<string, BadgeVariant> = {
  Open: "warning-soft",
  Approved: "info-soft",
  "In Progress": "orange-soft",
  Completed: "success-soft",
  Rejected: "danger-soft",
  Closed: "purple-soft",
};

type OverviewAction = "start" | "complete" | "close" | "reopen";

const actionConfig: Record<
  OverviewAction,
  { title: string; confirm: string; loading: string; body: React.ReactNode }
> = {
  start: {
    title: "Start Work",
    confirm: "Start Work",
    loading: "Starting...",
    body: "Mark this ticket as in progress.",
  },
  complete: {
    title: "Mark Completed",
    confirm: "Mark Completed",
    loading: "Completing...",
    body: "Mark the work on this ticket as completed.",
  },
  close: {
    title: "Close Ticket",
    confirm: "Close Ticket",
    loading: "Closing...",
    body: (
      <>
        Confirm that the work is done and accepted? The ticket will be marked{" "}
        <strong>Closed</strong>.
      </>
    ),
  },
  reopen: {
    title: "Reopen Ticket",
    confirm: "Reopen",
    loading: "Reopening...",
    body: "Reopen this ticket and send it back through the workflow.",
  },
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const {
    req_title,
    description,
    priority,
    status,
    category,
    location,
    photo,
    assignedTo,
    createdBy,
    createdAt,
    displayId,
    approvedBy,
    overview,
    overviewUpdatedBy,
    overviewUpdatedAt,
  } = ticket;

  const { user: currentUser } = useSelector(selectAuth);

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [pendingAction, setPendingAction] = useState<OverviewAction | null>(
    null,
  );
  const [overviewText, setOverviewText] = useState("");

  const [approveTicket, { isLoading: approving }] = useApproveTicketMutation();
  const [rejectTicket, { isLoading: rejecting }] = useRejectTicketMutation();
  const [startTicket, { isLoading: starting }] = useStartTicketMutation();
  const [completeTicket, { isLoading: completing }] =
    useCompleteTicketMutation();
  const [closeTicket, { isLoading: isClosing }] = useCloseTicketMutation();
  const [reopenTicket, { isLoading: isReopening }] = useReopenTicketMutation();

  const actionBusy = starting || completing || isClosing || isReopening;

  const actions = useMemo(
    () => getTicketActions({ ticket, currentUser }),
    [ticket, currentUser],
  );

  const meta: string[] = [
    `#${displayId}`,
    titleCase(category.name),
    location?.name || "No location",
    `Submitted: ${createdAt ? new Date(createdAt).toLocaleDateString() : ""}`,
  ];

  const openAction = (action: OverviewAction) => {
    setOverviewText(overview ?? ""); // prefill with the current overview
    setPendingAction(action);
  };

  const closeActionModal = () => {
    if (actionBusy) return;
    setPendingAction(null);
    setOverviewText("");
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const trigger = {
      start: startTicket,
      complete: completeTicket,
      close: closeTicket,
      reopen: reopenTicket,
    }[pendingAction];

    try {
      const res = await trigger({
        ticketId: ticket._id,
        overview: overviewText.trim(),
      }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setPendingAction(null);
        setOverviewText("");
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="card">
      <div
        className="card-body p-16 p-md-24 d-flex flex-column gap-2 gap-md-3"
        style={{ boxShadow: "0px 0px 10px 0px #00000012" }}
      >
        {/* Title + Badges */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-10">
          <h1 className="text-md xs:text-lg mb-0 text-street-dark fw-semibold">
            {req_title}
          </h1>
          <div className="d-flex flex-row gap-10">
            <Badge variant={statusVariant[status] ?? "secondary-soft"}>
              {status}
            </Badge>
            {priority && (
              <Badge
                variant={
                  priority === "High"
                    ? "danger-soft"
                    : priority === "Medium"
                      ? "warning-soft"
                      : "success-soft"
                }
              >
                {priority}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div
          className="parse Te"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
        />

        {/* Overview */}
        {overview && (
          <div className="bg-neutral-50 radius-8 p-12">
            <p
              className="text-xs text-street-dark mb-4 overview-clamp"
              style={{ whiteSpace: "pre-wrap" }}
            >
              <span className="fw-semibold">Update: </span>
              {overview}
            </p>
            {(overviewUpdatedBy || overviewUpdatedAt) && (
              <p className="text-xs text-muted mb-0">
                {overviewUpdatedBy && personName(overviewUpdatedBy)}
                {overviewUpdatedBy && overviewUpdatedAt && " • "}
                {overviewUpdatedAt &&
                  new Date(overviewUpdatedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="text-xs d-flex flex-column flex-md-row gap-1 gap-md-3 fw-normal">
          {meta.map((item, index) => (
            <span key={index}>
              {index > 0 && "• "}
              {item}
            </span>
          ))}
        </div>

        <hr />

        {/* Footer Section */}
        <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
          <div className="row gy-2 gx-3 w-auto align-items-sm-center">
            <div className="col-6 col-sm-auto">
              <p className="fw-normal text-xs mb-0">
                Submitted by:{" "}
                <span className="text-street-dark fw-medium text-xs">
                  {personName(createdBy)}
                </span>
              </p>
            </div>

            {assignedTo && (
              <div className="col-6 col-sm-auto">
                <p className="fw-normal text-xs mb-0">
                  • Assigned to:{" "}
                  <span className="text-street-dark fw-medium text-xs">
                    {personName(assignedTo)}
                  </span>
                </p>
              </div>
            )}

            {approvedBy && (
              <div className="col-6 col-sm-auto">
                <p className="fw-normal text-xs mb-0">
                  • Approved by:{" "}
                  <span className="text-street-dark fw-medium text-xs">
                    {personName(approvedBy)}
                  </span>
                </p>
              </div>
            )}

            {photo && (
              <div className="col-6 col-sm-auto d-flex align-items-center gap-2">
                <Icon
                  icon="lucide:paperclip"
                  className="text-street-dark w-16-px h-16-px"
                />
                <Link
                  to={`/photo-viewer?url=${encodeURIComponent(photo.fileUrl)}`}
                  target="_blank"
                  className="text-street-primary text-xs fw-normal"
                >
                  {photo.fileName}
                </Link>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="d-flex flex-row flex-wrap align-items-center gap-8">
            {actions.includes("close") && (
              <Button
                size="sm"
                className="btn-street-edit radius-12 px-12 d-flex align-items-center justify-content-center gap-1 border-0 text-xs fw-semibold"
                style={{ height: "40px" }}
                title="Close"
                aria-label="Close ticket"
                disabled={isClosing}
                onClick={() => openAction("close")}
              >
                <Icon icon="lucide:check-check" className="text-xl" />
              </Button>
            )}

            {actions.includes("reopen") && (
              <Button
                size="sm"
                className="btn-street-warning radius-12 px-12 d-flex align-items-center justify-content-center gap-1 border-0 text-xs fw-semibold"
                style={{ height: "40px" }}
                title="Reopen"
                aria-label="Reopen ticket"
                disabled={isReopening}
                onClick={() => openAction("reopen")}
              >
                <Icon icon="lucide:rotate-ccw" className="text-xl" />
              </Button>
            )}

            {actions.includes("chat") && <TicketComment ticket={ticket} />}

            {actions.includes("approve") && (
              <>
                <Button
                  className="btn-street-primary radius-12 px-16 d-flex align-items-center justify-content-center gap-2 border-0 text-sm fw-semibold"
                  style={{ height: "40px" }}
                  disabled={approving}
                  onClick={() => setShowApprove(true)}
                >
                  <Icon icon="lucide:check" className="w-16-px h-16-px" />
                  Approve
                </Button>
                <Button
                  className="btn-danger radius-12 px-16 d-flex align-items-center justify-content-center gap-2 border-0 text-sm fw-semibold"
                  style={{ height: "40px" }}
                  disabled={rejecting}
                  onClick={() => setShowReject(true)}
                >
                  <Icon icon="lucide:x" className="w-16-px h-16-px" />
                  Reject
                </Button>
              </>
            )}

            {actions.includes("start") && (
              <Button
                className="btn-street-primary radius-12 px-16 d-flex flex-row align-items-center justify-content-center gap-2 border-0 text-sm fw-semibold"
                style={{ height: "40px" }}
                disabled={starting}
                onClick={() => openAction("start")}
              >
                <Icon icon="lucide:play" className="w-16-px h-16-px" />
                {starting ? "Starting..." : "Start Work"}
              </Button>
            )}

            {actions.includes("complete") && (
              <Button
                className="btn-success radius-12 px-16 d-flex align-items-center justify-content-center gap-2 border-0 text-sm fw-semibold"
                style={{ height: "40px" }}
                disabled={completing}
                onClick={() => openAction("complete")}
              >
                <Icon
                  icon="lucide:check-circle-2"
                  className="w-16-px h-16-px"
                />
                {completing ? "Completing..." : "Mark Completed"}
              </Button>
            )}

            {actions.includes("edit") && <TicketDetails ticket={ticket} />}
            {actions.includes("delete") && <DeleteTicket ticket={ticket} />}
          </div>
        </div>
      </div>

      <ApproveTicketModal
        show={showApprove}
        onHide={() => setShowApprove(false)}
        isLoading={approving}
        onApprove={async (priority) => {
          try {
            const res = await approveTicket({
              ticketId: ticket._id,
              priority,
            }).unwrap();
            if (res.success) {
              showSuccess(res.message);
              setShowApprove(false);
            }
          } catch (error) {
            showError(getErrorMessage(error));
          }
        }}
      />

      <RejectTicketModal
        show={showReject}
        onHide={() => setShowReject(false)}
        isLoading={rejecting}
        onReject={async (reason) => {
          try {
            const res = await rejectTicket({
              ticketId: ticket._id,
              rejectionReason: reason,
            }).unwrap();
            if (res.success) {
              showSuccess(res.message);
              setShowReject(false);
            }
          } catch (error) {
            showError(getErrorMessage(error));
          }
        }}
      />

      {/* Shared modal: start / complete / close / reopen */}
      {pendingAction && (
        <ModalWrapper
          show
          onHide={closeActionModal}
          title={actionConfig[pendingAction].title}
          size="md"
          isLoading={actionBusy}
          footer={
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-street-primary btn-sm"
                onClick={handleConfirmAction}
                disabled={actionBusy}
              >
                {actionBusy
                  ? actionConfig[pendingAction].loading
                  : actionConfig[pendingAction].confirm}
              </button>
              <button
                className="btn btn-street-neutral btn-sm"
                onClick={closeActionModal}
                disabled={actionBusy}
              >
                Cancel
              </button>
            </div>
          }
        >
          <p>{actionConfig[pendingAction].body}</p>
          <label
            className="form-label text-xs fw-semibold"
            htmlFor="ticket-overview"
          >
            Update / Overview{" "}
            <span className="fw-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="ticket-overview"
            className="form-control"
            rows={4}
            maxLength={2000}
            value={overviewText}
            onChange={(e) => setOverviewText(e.target.value)}
            placeholder="Add a short update for everyone following this ticket"
            disabled={actionBusy}
          />
        </ModalWrapper>
      )}
    </div>
  );
};

export default TicketCard;
