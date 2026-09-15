import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
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
            type="button"
            className="btn btn-street-neutral btn-street-lg radius-12 px-4"
            onClick={onHide}
          >
            Close
          </button>
        </div>
      }
    >
      {!location ? (
        <div className="text-center py-5 text-street-base">
          <span>No data found</span>
        </div>
      ) : (
        <div className="d-flex flex-column gap-20">
          {/* Location Overview */}
          <div
            className="p-16 p-sm-20 rounded-3 border"
            style={{ backgroundColor: "var(--street-bg-f4)" }}
          >
            <div className="d-flex align-items-start gap-12">
              <div
                className="w-40-px h-40-px rounded-3 d-flex align-items-center justify-content-center border flex-shrink-0"
                style={{ backgroundColor: "var(--street-card)" }}
              >
                <Icon
                  icon="mdi:map-marker-outline"
                  className="text-street-primary text-xl"
                />
              </div>

              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start gap-12">
                  <div>
                    <p className="text-xs text-street-base mb-1">LOCATION</p>

                    <h5 className="mb-1 fw-semibold text-street-dark">
                      {location.name}
                    </h5>

                    {location.slug && (
                      <span className="text-xs text-street-base">
                        {location.slug}
                      </span>
                    )}
                  </div>

                  <Badge
                    variant={
                      location.isActive ? "success-soft" : "warning-soft"
                    }
                    shape="pill"
                  >
                    {location.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Property Managers */}
          <section>
            <div className="d-flex align-items-center justify-content-between mb-10">
              <div className="d-flex align-items-center gap-8">
                <Icon
                  icon="mdi:account-multiple-outline"
                  className="text-street-primary text-lg"
                />

                <span className="text-sm fw-semibold text-street-dark">
                  Property Managers
                </span>
              </div>

              <Badge variant="secondary-soft" shape="pill" small>
                {location.managers.length}
              </Badge>
            </div>

            {location.managers.length === 0 ? (
              <div
                className="p-16 rounded-3 text-center"
                style={{ backgroundColor: "var(--street-card)" }}
              >
                <Icon
                  icon="mdi:account-off-outline"
                  className="text-street-base text-xl mb-1"
                />

                <p className="text-sm text-street-base mb-0">
                  No property managers assigned
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-8">
                {location.managers.map((manager) => (
                  <div
                    key={manager._id}
                    className="d-flex align-items-center justify-content-between gap-12 p-12 p-sm-16 rounded-3 border"
                  >
                    <div className="d-flex align-items-center gap-12 min-width-0">
                      <div className="w-36-px h-36-px rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"  style={{ backgroundColor: "var(--street-card)" }}>
                        <Icon
                          icon="mdi:account-outline"
                          className="text-street-primary"
                        />
                      </div>

                      <div className="d-flex flex-column min-width-0">
                        <span className="text-sm fw-medium text-street-dark">
                          {manager.firstname} {manager.lastname}
                        </span>

                        <span className="text-xs text-street-base text-truncate">
                          {manager.email}
                        </span>
                      </div>
                    </div>

                    <Badge variant="primary-soft" shape="pill" small>
                      {manager.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Facility Manager */}
          <section>
            <div className="d-flex align-items-center gap-8 mb-10">
              <Icon
                icon="mdi:account-tie-outline"
                className="text-street-primary text-lg"
              />

              <span className="text-sm fw-semibold text-street-dark">
                Facility Manager
              </span>
            </div>

            {!location.facilityManager ? (
              <div
                className="p-16 rounded-3 text-center"
                style={{ backgroundColor: "var(--street-card)" }}
              >
                <Icon
                  icon="mdi:account-off-outline"
                  className="text-street-base text-xl mb-1"
                />

                <p className="text-sm text-street-base mb-0">
                  No facility manager assigned
                </p>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-between gap-12 p-12 p-sm-16 rounded-3 border">
                <div className="d-flex align-items-center gap-12 min-width-0">
                  <div
                    className="w-36-px h-36-px rounded-circle  d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ backgroundColor: "var(--street-card)" }}
                  >
                    <Icon 
                      icon="mdi:account-tie-outline"
                      className="text-street-primary"
                    />
                  </div>

                  <div className="d-flex flex-column min-width-0">
                    <span className="text-sm fw-medium text-street-dark">
                      {location.facilityManager.firstname}{" "}
                      {location.facilityManager.lastname}
                    </span>

                    <span className="text-xs text-street-base text-truncate">
                      {location.facilityManager.email}
                    </span>
                  </div>
                </div>

                <Badge variant="primary-soft" shape="pill" small>
                  {location.facilityManager.role}
                </Badge>
              </div>
            )}
          </section>

          {/* Metadata */}
          <div className="pt-16 border-top">
            <div className="row g-3">
              <div className="col-6">
                <div className="d-flex align-items-center gap-6 mb-1">
                  <Icon
                    icon="mdi:calendar-plus-outline"
                    className="text-street-base"
                  />

                  <span className="text-xs text-street-base fw-medium">
                    Created
                  </span>
                </div>

                <span className="text-xs text-street-dark">
                  {formatDate(location.createdAt)}
                </span>
              </div>

              <div className="col-6">
                <div className="d-flex align-items-center gap-6 mb-1">
                  <Icon
                    icon="mdi:calendar-edit-outline"
                    className="text-street-base"
                  />

                  <span className="text-xs text-street-base fw-medium">
                    Last Updated
                  </span>
                </div>

                <span className="text-xs text-street-dark">
                  {formatDate(location.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default ViewLocation;
