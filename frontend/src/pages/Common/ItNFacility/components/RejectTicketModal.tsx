import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";


interface RejectTicketModalProps {
  show: boolean;
  onHide: () => void;
  onReject: (reason: string) => Promise<void> | void;
  isLoading?: boolean;
}

const RejectTicketModal: React.FC<RejectTicketModalProps> = ({
  show,
  onHide,
  onReject,
  isLoading,
}) => {
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    if (!reason.trim()) return;

    await onReject(reason);
    setReason("");
    onHide();
  };

  return (
    <ModalWrapper
      show={show}
      onHide={onHide}
      title="Reject Ticket"
      subtitle="Please provide a reason for rejecting this ticket."
      size="md"
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
      <Form.Group>
        <Form.Label className="fw-semibold mb-2">
          Rejection Reason
        </Form.Label>

        <Form.Control
          as="textarea"
          rows={4}
          value={reason}
          placeholder="Enter rejection reason..."
          onChange={(e) => setReason(e.target.value)}
        />
      </Form.Group>
    </ModalWrapper>
  );
};

export default RejectTicketModal;