import React from "react";
import { type Location } from "../../../../../services/locationApi";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import Badge from "../../../../../components/child/Badge";

type ViewLocationProps = {
  location: Location;
  show: boolean;
  onHide: () => void;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const ViewLocation: React.FC<ViewLocationProps> = ({
  location,
  show,
  onHide,
}) => {
  return (
    <ModalWrapper
      title="Location Details"
      size="md"
      show={show}
      onHide={onHide}
      footer={
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-street-neutral btn-street-lg radius-12 px-4"
            onClick={onHide}
          >
            Close
          </button>
        </div>
      }
    >
      {!location ? (
        <div className="text-center py-5 text-muted">
          <span>No data found</span>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {/* Header Card: Name & Status */}
          <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light border">
            <div>
              <div className="text-xs text-muted text-uppercase fw-semibold mb-1">
                Location Name
              </div>
              <h5 className="mb-0 fw-bold text-street-dark">{location.name}</h5>
            </div>
            <Badge
              variant={location.isActive ? "success-soft" : "warning-soft"}
            >
              {location.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Managers Section */}
          <div className="px-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-xs text-muted text-uppercase fw-semibold">
                Assigned Managers
              </span>
              <span className="badge bg-secondary-subtle text-dark rounded-pill">
                {location.managers.length}
              </span>
            </div>

            {location.managers.length === 0 ? (
              <div className="p-3 text-center bg-light rounded text-muted text-sm border border-dashed">
                No managers assigned
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {location.managers.map((manager) => (
                  <div
                    key={manager._id}
                    className="d-flex justify-content-between align-items-center p-3 rounded border bg-white shadow-sm-hover"
                  >
                    <div className="d-flex flex-column">
                      <span className="text-sm fw-semibold text-street-dark">
                        {manager.firstname} {manager.lastname}
                      </span>
                      <span className="text-xs text-muted">
                        {manager.email}
                      </span>
                    </div>
                    <Badge variant="primary-soft">{manager.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timestamps Card */}
          <div className="row g-3 pt-2 mt-1 border-top">
            <div className="col-6">
              <span className="d-block text-xs text-muted text-uppercase fw-semibold mb-1">
                Created At
              </span>
              <span className="text-sm text-street-dark fw-medium">
                {formatDate(location.createdAt)}
              </span>
            </div>
            <div className="col-6">
              <span className="d-block text-xs text-muted text-uppercase fw-semibold mb-1">
                Last Updated
              </span>
              <span className="text-sm text-street-dark fw-medium">
                {formatDate(location.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default ViewLocation;
