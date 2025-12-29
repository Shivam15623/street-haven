// TicketCard.tsx
import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import TicketDetails from "./TicketEdit";
import Badge from "../../../../components/child/Badge";
import type { TicketData } from "../../../../interfaces/Ticket";
import TicketComment from "./TicketComment";

import DOMPurify from "dompurify";

interface TicketCardProps {
  ticket: TicketData;
}

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
    _id,
  } = ticket;


  // Meta info
  const meta: string[] = [
    `#${_id}`, // Ticket ID
    category,
    location || "No location",
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
            <Badge
              variant={
                status === "Completed"
                  ? "success-soft"
                  : status === "Open"
                  ? "danger-soft"
                  : status === "In Progress"
                  ? "warning-soft"
                  : "primary-soft"
              }
            >
              {status}
            </Badge>
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
          <div className="d-flex flex flex-row gap-2">
            <TicketComment ticket={ticket} />

            <TicketDetails ticket={ticket} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
