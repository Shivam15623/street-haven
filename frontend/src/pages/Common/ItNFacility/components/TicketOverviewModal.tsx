import React from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import type { TicketData } from "../../../../interfaces/Ticket";
import { personName } from "../../../../utills/userDisplay";

type Props = {
  show: boolean;
  onHide: () => void;
  ticketTitle: string;
  overview: string;
  updatedBy?: TicketData["overviewUpdatedBy"];
  updatedAt?: string;
  footer?: React.ReactNode;
};

const TicketOverviewModal: React.FC<Props> = ({
  show,
  onHide,
  ticketTitle,
  overview,
  updatedBy,
  updatedAt,
  footer,
}) => {
  const subtitle = [
    updatedBy ? personName(updatedBy) : null,
    updatedAt ? new Date(updatedAt).toLocaleString() : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <ModalWrapper
      show={show}
      onHide={onHide}
      title={`Update: ${ticketTitle}`}
      subtitle={subtitle || undefined}
      size="lg"
      footer={footer}
    >
      <p
        className="text-sm text-street-dark mb-0"
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {overview}
      </p>
    </ModalWrapper>
  );
};

export default TicketOverviewModal;