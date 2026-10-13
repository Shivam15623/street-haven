import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";

interface RejectTicketModalProps {
  show: boolean;
  onHide: () => void;
  onReject: (reason: string, overview: string) => Promise<void> | void;
  isLoading?: boolean;
}

const RejectTicketModal: React.FC<RejectTicketModalProps> = ({
  show,
  onHide,
  onReject,
  isLoading,
}) => {
  const [reason, setReason] = useState("");
  const [overview, setOverview] = useState("");

  // Reset the form whenever the modal closes
  useEffect(() => {
    if (!show) {
      setReason("");
      setOverview("");
    }
  }, [show]);

  const handleReject = async () => {
    if (!reason.trim() || isLoading) return;

    // Keep the modal open if rejection fails
    await onReject(reason.trim(), overview.trim());
  };

  return (
    <ModalWrapper
      show={show}
      onHide={onHide}
      title="Reject Ticket"
      subtitle="Please provide a reason for rejecting this ticket."
      size="md"
      isLoading={isLoading}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onHide}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleReject}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? "Rejecting..." : "Reject"}
          </Button>
        </>
      }
    >
      <div className="d-flex flex-column gap-3">
        <div>
          <label
            className="fw-semibold text-street-dark mb-2"
            htmlFor="reject-reason"
          >
            Rejection Reason <span className="text-danger">*</span>
          </label>

          <textarea
            id="reject-reason"
            className="form-control"
            rows={3}
            maxLength={2000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this ticket is being rejected..."
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label
            className="fw-semibold text-street-dark mb-2"
            htmlFor="reject-overview"
          >
            Update / Overview{" "}
            <span className="fw-normal text-muted">(optional)</span>
          </label>

          <textarea
            id="reject-overview"
            className="form-control"
            rows={4}
            maxLength={2000}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Add a short update for everyone following this ticket"
            disabled={isLoading}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default RejectTicketModal;
