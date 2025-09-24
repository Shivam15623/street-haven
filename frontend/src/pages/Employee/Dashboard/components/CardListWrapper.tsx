import React from "react";
import { Link } from "react-router-dom";

interface CardWrapperProps {
  title: string;
  viewAllLink?: string; // optional
  children: React.ReactNode;
}

const CardlistWrapper: React.FC<CardWrapperProps> = ({ title, viewAllLink = "#", children }) => {
  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-lg-24">
        <div className="d-flex flex-column gap-20">
          {/* Header */}
          <div className="d-flex align-items-center flex-wrap  justify-content-between">
            <h6 className="fw-bold text-md xs:text-lg text-street-dark mb-0">{title}</h6>
            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="text-street-primary hover-text-primary d-flex text-xxs  xs:text-xs align-items-center"
              >
                View All
              </Link>
            )}
          </div>

          {/* Body */}
          <div className="d-flex flex-column gap-3">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CardlistWrapper;
