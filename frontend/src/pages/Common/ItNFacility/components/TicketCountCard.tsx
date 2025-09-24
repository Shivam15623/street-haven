import React from "react";
import { Icon } from "@iconify/react";

type TicketCountCardProps = {
  count: number ;
  label: string;
  variant?: "open" | "completed" | "progress" | "total" | "review";
  icon?: string; // lucide icon name
  onClick?: () => void; // click handler
  active: boolean; // highlight active filter
};

export const TicketCountCard: React.FC<TicketCountCardProps> = ({
  count,
  label,
  variant = "neutral",
  icon = "lucide:circle-alert",
  onClick,
  active = false,
}) => {
  return (
    <div className="col">
      <div
        className={`card h-100 ticket-card `}
        style={{ cursor: "pointer" }}
        onClick={onClick}
      >
        <div
          className={`card-body d-flex flex-row ticket-card h-100 align-items-center ${
            active ? "active-count-card" : ""
          } ${variant} justify-content-between p-16 p-sm-24`}
        >
          <div className="d-flex flex-column gap-1">
            <h4 className="text-street-dark fw-bold text-lg xs:text-xxl mb-0">
              {count}
            </h4>
            <p className="text-xs xs:text-sm fw-normal">{label}</p>
          </div>
          <div className={`ticket-icon ${variant}`}>
            <Icon icon={icon} width={20} height={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
