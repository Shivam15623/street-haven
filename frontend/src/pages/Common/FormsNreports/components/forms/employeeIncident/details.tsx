import React, { useState } from "react";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {  Container } from "react-bootstrap";
import { Icon } from "@iconify/react";
import type { employeeIncidentReport } from "../../../../../../services/FormApi";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import Badge from "../../../../../../components/child/Badge";

dayjs.extend(localizedFormat);



export const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string;
}) => (
  <div className="h-100 p-16 radius-12 bg-neutral-50 border-sh-base-1-2">
    <div className="d-flex align-items-center gap-2 text-street-base mb-1">
      <Icon icon={icon} width={16} />
      <small className="fw-semibold text-uppercase">{label}</small>
    </div>
    <p className="mb-0 fw-medium">{value || "N/A"}</p>
  </div>
);

export const SectionTitle = ({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) => (
  <h6 className="d-flex align-items-center gap-2 text-sm mb-8">
    <Icon icon={icon} width={18} />
    {children}
  </h6>
);



const EmployeeIncidentReportDetails = ({
  detail,
}: {
  detail: employeeIncidentReport;
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="btn btn-street-primary d-flex align-items-center gap-2 radius-12"
        onClick={() => setShowModal(true)}
      >
        View Details
      </button>

      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        title="Employee Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32"
        bodyClassName="p-0"
      >
        <div className="py-3" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Container className="d-flex flex-column gap-24 ">
            <div className="bg-neutral-50 border-sh-base-1-2 rounded-3 shadow-none card p-16">
              <div className="card-body p-0">
                <div className="d-flex flex-row align-items-start justify-content-between">
                  <div className="d-flex flex-row flex-nowrap gap-2">
                    <div>
                      <div className="p-12 border-sh-primary-50 bg-street-primary-10 rounded-circle">
                        <Icon
                          icon="lucide:user"
                          fontSize={24}
                          className="text-street-primary"
                        />
                      </div>
                    </div>

                    <div className="d-flex flex-column flex-grow-1 ">
                      <p className="fw-semibold text-lg text-street-dark">
                        {detail.name}
                      </p>
                      <p className="text-sm text-street-base d-flex align-items-center gap-1 mt-1">
                        <Icon icon="lucide:briefcase" fontSize={14} />
                        {detail.jobTitle}
                      </p>
                      <p className="text-sm text-street-base mt-1">
                        Supervisor:{" "}
                        <span className="fw-medium text-street-dark">
                          {detail.supervisor}
                        </span>
                      </p>
                      <div className="d-flex flex-row gap-1 mt-3">
                        {" "}
                        <Badge
                          variant={
                            detail.informedSupervisor ? "primary" : "danger"
                          }
                          className="px-1 d-flex align-items-center"
                        >
                          <span> Superviser Informed</span>
                          <Icon
                            icon={
                              detail.informedSupervisor
                                ? "mdi:check-bold"
                                : "mdi:close-thick"
                            }
                            fontSize={14}
                          />
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant="danger-soft"> {detail.reportType} </Badge>
                </div>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                {" "}
                <div className="p-16 card border h-100">
                  <div className="card-body p-0">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon
                        fontSize={14}
                        icon="lucide:calendar"
                        className="text-street-base"
                      />
                      <span className="text-sm text-street-base fw-medium">
                        Injury Date
                      </span>
                    </div>

                    <p className="fw-semibold text-street-dark text-md">
                      {dayjs(detail.injuryDate).format("MMM DD YYYY")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                {" "}
                <div className="p-16 card border h-100">
                  <div className="card-body p-0">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon
                        fontSize={14}
                        icon="lucide:clock"
                        className="text-street-base"
                      />
                      <span className="text-sm text-street-base fw-medium">
                        Injury Time
                      </span>
                    </div>

                    <p className="fw-semibold text-street-dark text-md">
                      {detail.injuryTime}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                {" "}
                <div className="p-16 card border h-100">
                  <div className="card-body p-0">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon
                        fontSize={14}
                        icon="lucide:map-pin"
                        className="text-street-base"
                      />
                      <span className="text-sm text-street-base fw-medium">
                        Location
                      </span>
                    </div>

                    <p className="fw-semibold text-street-dark text-md">
                      {detail.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-16 card border h-100">
              <div className="card-body p-0">
                <div className="d-flex align-items-center gap-2">
                  <Icon
                    fontSize={18}
                    icon="lucide:eye"
                    className="text-street-base"
                  />
                  <span className="text-sm text-street-base ">
                    Witness:{" "}
                    <span className="fw-medium text-street-dark">
                      {detail.witnessName ? detail.witnessName : "N/A"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <hr />
            <div className="p-16 card border h-100">
              <div className="card-body p-0">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Icon
                    fontSize={18}
                    icon="lucide:activity"
                    className="text-street-base"
                  />
                  <span className="text-sm text-street-base fw-medium">
                    Activity at Time of Incident
                  </span>
                </div>

                <p className="fw-semibold text-md">{detail.activityAtTime}</p>
              </div>
            </div>
            <div className="p-16 card border h-100">
              <div className="card-body p-0">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Icon
                    fontSize={18}
                    icon="lucide:file-warning"
                    className="text-street-base"
                  />
                  <span className="text-sm text-street-base fw-medium">
                    Description
                  </span>
                </div>

                <p className="fw-semibold text-md">{detail.description}</p>
              </div>
            </div>
            <div className="p-16 border rounded-3 border-danger bg-danger bg-opacity-10">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <span className="text-sm fw-medium text-danger">
                  Injured Body Part / Risk: {detail.injuredBodyPartOrRisk}
                </span>
              </div>
            </div>
            <div className="p-16 border rounded-3 border-sh-primary-50 bg-street-primary-10 ">
              <div className="d-flex align-items-center gap-2">
                <Icon
                  icon="lucide:shield"
                  fontSize={16}
                  className=" text-street-primary"
                />
                <span className="text-sm fw-medium text-street-primary">
                  Prevention Suggestion
                </span>
              </div>
              <p className="text-sm text-street-base">
                {detail.preventionSuggestion}
              </p>
            </div>

            {/* Employee Info */}
            <div>
              <h3 className="text-sm fw-semibold mb-3 d-flex align-items-center gap-2">
                <Icon
                  icon="lucide:stethoscope"
                  width={16}
                  className="text-street-base"
                />
                Medical Information
              </h3>
              <div className="p-16 rounded-3 card border shadow-sm">
                <div className="card-body p-0">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-sm text-street-base">Saw Doctor</span>
                    <Badge variant={detail.sawDoctor ? "primary" : "secondary"}>
                      {detail.sawDoctor ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {detail.sawDoctor && (
                    <div className=" pt-12 d-flex flex-column gap-2 border-top">
                      <div className="d-flex align-items-center gap-2">
                        <Icon
                          icon="lucide:user"
                          width={16}
                          className="text-street-base"
                        />

                        <span className="fw-medium text-street-dark">
                          Dr. {detail.doctorName}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Icon
                          icon="lucide:phone"
                          width={16}
                          className="text-street-base"
                        />

                        <span className="text-sm">+1 (416) 555-1234</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-sm text-street-base">
                        <Icon
                          icon="lucide:calendar"
                          width={16}
                          className="text-street-base"
                        />

                        <span>
                          {dayjs(detail.doctorVisitDate).format("MMM DD YYYY")}{" "}
                          at{" "}
                          {detail.doctorVisitTime}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="d-flex align-items-center justify-content-between mt-12 pt-12 border-top">
                    <span className="text-sm text-street-base">
                      Previous Similar Injury
                    </span>
                    <Badge
                      variant={detail.previousInjury ? "primary" : "secondary"}
                    >
                      {detail.previousInjury ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {detail.previousInjury && (
                    <div className="mt-8 d-flex align-items-center gap-2 text-sm text-street-base">
                      <Icon icon="lucide:calendar" width={14} />
                      <span>
                        Previous Injury Date:{" "}
                        <span className="fw-medium text-street-dark">
                          {detail.previousInjuryDate
                            ? dayjs(detail.previousInjuryDate).format(
                                "MMM DD YYYY"
                              )
                            : "N/A"}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EmployeeIncidentReportDetails;
