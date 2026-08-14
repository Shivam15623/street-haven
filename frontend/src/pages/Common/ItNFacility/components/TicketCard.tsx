// TicketCard.tsx
import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import TicketDetails from "./TicketEdit";
import Badge, { type BadgeVariant } from "../../../../components/child/Badge";
import type { TicketData } from "../../../../interfaces/Ticket";
import TicketComment from "./TicketComment";

import DOMPurify from "dompurify";
import {
  useApproveTicketMutation,
  useCancelTicketMutation,
  useCompleteTicketMutation,
  useRejectTicketMutation,
  useStartTicketMutation,
} from "../../../../services/ticketApi";
import RejectTicketModal from "./RejectTicketModal";
import ApproveTicketModal from "./ApproveTicketModal";
import { Button } from "react-bootstrap";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";
import { useSelector } from "react-redux";
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
  Closed: "secondary-soft",
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
  } = ticket;
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const [approveTicket, { isLoading: approving }] = useApproveTicketMutation();
  const [startTicket, { isLoading: starting }] = useStartTicketMutation();
  const [completeTicket, { isLoading: completing }] =
    useCompleteTicketMutation();
  const [cancelTicket, { isLoading: cancelling }] = useCancelTicketMutation();
  const [rejectTicket, { isLoading: rejecting }] = useRejectTicketMutation();
  const { user: currentUser } = useSelector(selectAuth);


  const actions = useMemo(
    () =>
      getTicketActions({
        ticket,
        currentUser,
      }),
    [ticket, currentUser],
  );
  const meta: string[] = [
    `#${displayId}`, // Ticket ID
    titleCase(category.name),
    location?.name || "No location",
    `Submitted: ${createdAt ? new Date(createdAt).toLocaleDateString() : ""}`,
  ];

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
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(description),
          }}
        />

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
            {/* Submitted by */}
            <div className="col-6 col-sm-auto">
              <p className="fw-normal text-xs mb-0">
                Submitted by:{" "}
                <span className="text-street-dark fw-medium text-xs">
                  {createdBy.firstname} {createdBy.lastname}
                </span>
              </p>
            </div>

            {/* Assigned to */}
            {assignedTo && (
              <div className="col-6 col-sm-auto">
                <p className="fw-normal text-xs mb-0">
                  • Assigned to:{" "}
                  <span className="text-street-dark fw-medium text-xs">
                    {assignedTo.firstname} {assignedTo.lastname}
                  </span>
                </p>
              </div>
            )}

            {approvedBy&&(
               <div className="col-6 col-sm-auto">
                <p className="fw-normal text-xs mb-0">
                  • Approved by:{" "}
                  <span className="text-street-dark fw-medium text-xs">
                    {approvedBy.firstname} {approvedBy.lastname}
                  </span>
                </p>
              </div>
            )}

            {/* Attachments */}
            {photo && (
              <div className="col-6 col-sm-auto d-flex align-items-center gap-2">
                <Icon
                  icon="lucide:paperclip"
                  className="text-street-dark w-16-px h-16-px"
                />
                <Link
                  to={photo.fileUrl}
                  target="_blank"
                  className="text-street-primary text-xs fw-normal"
                >
                  {photo.fileName}
                </Link>
              </div>
            )}
          </div>
          {/* Footer actions — unified button system: radius-12, fixed 40px height, consistent icon+label gap */}
          <div className="d-flex flex-row flex-wrap align-items-center gap-8">
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
                onClick={async () => {
                  try {
                    const res = await startTicket(ticket._id).unwrap();
                    if (res.success) showSuccess(res.message);
                  } catch (error) {
                    showError(getErrorMessage(error));
                  }
                }}
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
                onClick={async () => {
                  try {
                    const res = await completeTicket(ticket._id).unwrap();
                    if (res.success) showSuccess(res.message);
                  } catch (error) {
                    showError(getErrorMessage(error));
                  }
                }}
              >
                <Icon
                  icon="lucide:check-circle-2"
                  className="w-16-px h-16-px"
                />
                {completing ? "Completing..." : "Mark Completed"}
              </Button>
            )}

            {actions.includes("cancel") && (
              <Button
                className="btn-street-neutral radius-12 px-16 d-flex flex-row align-items-center justify-content-center gap-2 border-0 text-sm fw-semibold"
                style={{ height: "40px" }}
                disabled={cancelling}
                onClick={async () => {
                  try {
                    const res = await cancelTicket(ticket._id).unwrap();
                    if (res.success) showSuccess(res.message);
                  } catch (error) {
                    showError(getErrorMessage(error));
                  }
                }}
              >
                <Icon icon="lucide:x-circle" className="w-16-px h-16-px" />
                {cancelling ? "Cancelling..." : "Cancel"}
              </Button>
            )}

            {actions.includes("edit") && <TicketDetails ticket={ticket} />}
          </div>
          {/* <div className="d-flex flex flex-row gap-2">
            <TicketComment ticket={ticket} />
            {isManagerOfLocation && status === "Open" && (
              <>
                <Button
                  className="btn-street-primary"
                  onClick={() => setShowApprove(true)}
                >
                  Approve
                </Button>
                <Button variant="danger" onClick={() => setShowReject(true)}>
                  Reject
                </Button>
              </>
            )}
            {isAssignee && status === "Approved" && (
              <Button
                className="btn-street-primary"
                disabled={starting}
                onClick={async () => {
                  try {
                    const res = await startTicket(ticket._id).unwrap();
                    if (res.success) showSuccess(res.message);
                  } catch (error) {
                    showError(getErrorMessage(error));
                  }
                }}
              >
                Start Work
              </Button>
            )}

            {isAssignee && status === "In Progress" && (
              <Button
                variant="success"
                disabled={completing}
                onClick={async () => {
                  try {
                    const res = await completeTicket(ticket._id).unwrap();
                    if (res.success) showSuccess(res.message);
                  } catch (error) {
                    showError(getErrorMessage(error));
                  }
                }}
              >
                Mark Completed
              </Button>
            )}

        
            {isCreator && status === "Open" && (
              <Button
                variant="outline-danger"
                disabled={cancelling}
                onClick={async () => {
                  try {
                    const res = await cancelTicket(ticket._id).unwrap();
                    if (res.success) showSuccess(res.message);
                  } catch (error) {
                    showError(getErrorMessage(error));
                  }
                }}
              >
                Cancel
              </Button>
            )}
            <TicketDetails ticket={ticket} />
          </div> */}
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
              setShowReject(false)
            }
          } catch (error) {
            showError(getErrorMessage(error));
          }
        }}
      />
    </div>
  );
};

export default TicketCard;
