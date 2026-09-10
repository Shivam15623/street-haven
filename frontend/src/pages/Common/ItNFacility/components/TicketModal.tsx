import React from "react";
import { Row, Col, Image } from "react-bootstrap";
import type { TicketData } from "../../../../interfaces/Ticket";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import type { BadgeVariant } from "../../../../components/child/Badge";
import Badge from "../../../../components/child/Badge";

import DOMPurify from "dompurify";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";

export interface TicketDetailsModalProps {
  show: boolean;
  onHide: () => void;
  isLoading: boolean;
  ticket?: TicketData;
}
const statusVariant: Record<string, BadgeVariant> = {
  Open: "warning-soft",
  Approved: "info-soft",
  "In Progress": "orange-soft",
  Completed: "success-soft",
  Rejected: "danger-soft",
  Closed: "secondary-soft",
};

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="mb-3">
    <div className="text-xxs text-uppercase text-muted fw-semibold mb-1">
      {label}
    </div>
    <div className="text-sm text-street-dark">{children}</div>
  </div>
);

const formatDate = (date?: Date) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  show,
  onHide,
  isLoading,
  ticket,
}) => {



  if (!ticket) return null;

  return (
    <ModalWrapper
      show={show}
      isLoading={isLoading}
      ModalLoader={
        <FormSubmissionLoader
          isLoading={isLoading}
          variant="spinner" // spinner | dots | pulse | progress
          message="Fetching Details..."
          subMessage="Please wait"
        />
      }
      onHide={onHide}
      footer={
        <div className="d-flex justify-content-end gap-3">
        
          <button
            className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            onClick={onHide}
          >
            Cancel
          </button>
        </div>
      }
      title={`Ticket ${ticket.displayId}`}
      subtitle={ticket.req_title}
      size="lg"
    >
      <Row>
        <Col md={6}>
          <DetailItem label="Status">
            <Badge variant={statusVariant[ticket.status] ?? "secondary-soft"}>
              {ticket.status}
            </Badge>
          </DetailItem>
        </Col>
        <Col md={6}>
          <DetailItem label="Priority">
            <Badge
              variant={
                ticket.priority === "High"
                  ? "danger-soft"
                  : ticket.priority === "Medium"
                    ? "warning-soft"
                    : "success-soft"
              }
            >
              {ticket.priority}
            </Badge>
          </DetailItem>
        </Col>

        <Col md={6}>
          <DetailItem label="Category">{ticket.category.name}</DetailItem>
        </Col>
        <Col md={6}>
          <DetailItem label="Location">
            {ticket.location?.name ?? "—"}
          </DetailItem>
        </Col>

        <Col md={12}>
          <DetailItem label="Description">
            <div
              className="parse Te"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(ticket.description),
              }}
            />
          </DetailItem>
        </Col>

        {ticket.photo && (
          <Col md={12}>
            <DetailItem label="Attached Photo">
              <a href={ticket.photo.fileUrl} target="_blank" rel="noreferrer">
                <Image
                  src={ticket.photo.fileUrl}
                  alt={ticket.photo.fileName}
                  thumbnail
                  style={{ maxHeight: 180 }}
                />
              </a>
              <div className="text-xxs text-muted mt-1">
                {ticket.photo.fileName}
              </div>
            </DetailItem>
          </Col>
        )}

        <Col md={6}>
          <DetailItem label="Created By">
            {ticket.createdBy.firstname} {ticket.createdBy.lastname}
            <div className="text-xxs text-muted">{ticket.createdBy.email}</div>
          </DetailItem>
        </Col>
        <Col md={6}>
          <DetailItem label="Assigned To">
            {ticket.assignedTo
              ? `${ticket.assignedTo.firstname} ${ticket.assignedTo.lastname}`
              : "Unassigned"}
          </DetailItem>
        </Col>

        {ticket.approvedBy && (
          <Col md={6}>
            <DetailItem label="Approved By">
              {ticket.approvedBy.firstname} {ticket.approvedBy.lastname}
            </DetailItem>
          </Col>
        )}

        <Col md={6}>
          <DetailItem label="Created At">
            {formatDate(ticket.createdAt)}
          </DetailItem>
        </Col>
        <Col md={6}>
          <DetailItem label="Last Updated">
            {formatDate(ticket.updatedAt)}
          </DetailItem>
        </Col>
      </Row>
    </ModalWrapper>
  );
};

export default TicketDetailsModal;
