import React, { useState } from "react";
import { Button } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";

interface ApproveTicketModalProps {
  show: boolean;
  onHide: () => void;
  onApprove: (priority: string) => Promise<void> | void;
  isLoading?: boolean;
}

// Must match the Mongoose schema enum exactly: ["Low", "Medium", "High"]
const PRIORITIES = [
  { value: "Low", color: "#2f9e44", bg: "#ebfbee" },
  { value: "Medium", color: "#e8590c", bg: "#fff4e6" },
  { value: "High", color: "#c92a2a", bg: "#fff5f5" },
] as const;

const ApproveTicketModal: React.FC<ApproveTicketModalProps> = ({
  show,
  onHide,
  onApprove,
  isLoading,
}) => {
  const [priority, setPriority] = useState<string>("Medium");

  const handleApprove = async () => {
    await onApprove(priority);
    onHide();
  };

  return (
    <ModalWrapper
      show={show}
      onHide={onHide}
      title="Approve Ticket"
      subtitle="Select a priority before approving this ticket."
      size="md"
      isLoading={isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="btn-street-primary"
            onClick={handleApprove}
            disabled={isLoading}
          >
            {isLoading ? "Approving..." : "Approve"}
          </Button>
        </>
      }
    >
      <div className="d-flex flex-column gap-8">
        <label className="fw-semibold text-street-dark mb-1">Priority</label>

        <div className="d-flex gap-8">
          {PRIORITIES.map((item) => {
            const isSelected = priority === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setPriority(item.value)}
                disabled={isLoading}
                className="btn flex-grow-1 fw-medium radius-8"
                style={{
                  border: `1.5px solid ${isSelected ? item.color : "#dee2e6"}`,
                  backgroundColor: isSelected ? item.bg : "transparent",
                  color: isSelected ? item.color : "#495057",
                  padding: "10px 0",
                  transition: "all 0.15s ease",
                }}
              >
                {item.value}
              </button>
            );
          })}
        </div>

        <p className="text-xxs text-street-dark opacity-75 mt-1 mb-0">
          This sets the ticket's priority and locks it once approved.
        </p>
      </div>
    </ModalWrapper>
  );
};

export default ApproveTicketModal;
