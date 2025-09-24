import { Icon } from "@iconify/react/dist/iconify.js";
import React, { type ReactNode } from "react";

interface AnnouncementCardWrapperProps {
  title: string;
  createdBy: string;
  created_At: string;
  description: string;
  children?: ReactNode;
  CTATrigger?: ReactNode;
}

const AnnouncementCardWrapper: React.FC<AnnouncementCardWrapperProps> = ({
  title,
  createdBy,
  created_At,
  description,
  children,
  CTATrigger,
}) => {
  return (
    <div className="d-flex flex-column event-card gap-3 px-12 px-md-24 py-10 h-100 py-md-20 border-0-5 border-sh-base rounded-2">
      {/* Header with icon and title */}
      <div className="d-flex flex-row justify-content-between">
        <div className="d-flex flex-row gap-8 gap-sm-16">
          <div className="event-icon d-flex align-items-center justify-content-center rounded-3 p-2 w-40-px h-40-px  ">
            <Icon
              icon="lucide:calendar"
              className="text-lg sm:text-xxl "
            />
          </div>
          <div className="d-flex flex-column justify-content-center gap-1 ">
            <div className="fw-semibold text-xs xs:text-sm text-street-dark">
              {title}
            </div>
            <p className="mb-0 text-xxs xs:text-xs fw-normal">
              {createdBy} <span className="ms-1">• {created_At}</span>
            </p>
          </div>
        </div>
        <div>{CTATrigger}</div>
      </div>

      {/* Description */}
      <p className="fw-normal text-xs xs:text-sm">{description}</p>

      {/* Extra children (buttons, tags, etc.) */}
      {children}
    </div>
  );
};

export default AnnouncementCardWrapper;
