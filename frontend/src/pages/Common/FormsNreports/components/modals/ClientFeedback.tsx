import { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import type { clientFeedbackData } from "../../../../../services/FormApi";
import { Badge, Col, Container, Row } from "react-bootstrap";
import { Icon } from "@iconify/react/dist/iconify.js";
import localizedFormat from "dayjs/plugin/localizedFormat";
import dayjs from "dayjs";
dayjs.extend(localizedFormat);
const getComplaintBadgeVariant = (nature: string) => {
  switch (nature) {
    case "Staff Behaviour":
      return "danger";
    case "Product Issue":
      return "warning";
    case "Service Issue":
      return "info";
    default:
      return "secondary";
  }
};
const formatDate = (date: string | Date) => dayjs(date).format("DD MMM YYYY");

const formatDateTime = (date: string | Date) =>
  dayjs(date).format("DD MMM YYYY, h:mm A");
const ClientFeedback = ({ detail }: { detail: clientFeedbackData }) => {
  const [showModal, setShowModal] = useState(false);
  const hasClientInfo =
    detail.clientName ||
    detail.clientPhone ||
    detail.clientEmail ||
    detail.clientAddress;
  return (
    <>
      {" "}
      <button
        className="btn btn-street-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12 gap-2"
        onClick={() => setShowModal(true)}
      >
        View Details
      </button>
      <ModalWrapper
        show={showModal}
        title="Incident Report Details"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Container className=" animate-fade-in d-flex flex-column gap-24 ">
            {/* Visit Info */}
            <Row className="g-3 mb-4">
              <Col md={6}>
                <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                      <Icon icon="mdi:calendar" width={16} />
                      <small className="fw-semibold text-uppercase">
                        Visit Date
                      </small>
                    </div>
                    <p className="mb-0 fw-medium">
                      {formatDate(detail.visitDate)}
                    </p>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                      <Icon icon="mdi:map-marker" width={16} />
                      <small className="fw-semibold text-uppercase">
                        Visit Location
                      </small>
                    </div>
                    <p className="mb-0 fw-medium">{detail.visitLocation}</p>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Client Information */}
            {hasClientInfo && (
              <>
                <hr />
                <div className="d-flex flex-column ">
                  <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                    <Icon icon="mdi:account" width={18} />
                    Client Information
                  </h6>

                  <Row className="g-3 mb-4">
                    {detail.clientName && (
                      <Col md={6}>
                        <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                          <div className="card-body">
                            <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                              <Icon icon="mdi:account-outline" width={14} />
                              <small>Name</small>
                            </div>
                            <p className="mb-0 fw-medium">
                              {detail.clientName}
                            </p>
                          </div>
                        </div>
                      </Col>
                    )}

                    {detail.clientPhone && (
                      <Col md={6}>
                        <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                          <div className="card-body">
                            <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                              <Icon icon="mdi:phone" width={14} />
                              <small>Phone</small>
                            </div>
                            <p className="mb-0 font-monospace">
                              {detail.clientPhone}
                            </p>
                          </div>
                        </div>
                      </Col>
                    )}

                    {detail.clientEmail && (
                      <Col md={6}>
                        <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                          <div className="card-body">
                            <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                              <Icon icon="mdi:email-outline" width={14} />
                              <small>Email</small>
                            </div>
                            <p className="mb-0 text-break">
                              {detail.clientEmail}
                            </p>
                          </div>
                        </div>
                      </Col>
                    )}

                    {detail.clientAddress && (
                      <Col md={6}>
                        <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                          <div className="card-body">
                            <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                              <Icon icon="mdi:home-outline" width={14} />
                              <small>Address</small>
                            </div>
                            <p className="mb-0">{detail.clientAddress}</p>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              </>
            )}

            <hr />

            {/* Complaint Details */}
            <div className="d-flex flex-column ">
              {" "}
              <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                <Icon icon="mdi:alert-circle-outline" width={18} />
                Complaint Details
              </h6>
              <div>
                <small className="text-street-base d-block mb-2">
                  Nature of Complaint
                </small>
                <Badge
                  bg={getComplaintBadgeVariant(detail.complaintNature)}
                  className="px-3 py-2 rounded-pill"
                >
                  {detail.complaintNature}
                  {detail.complaintNature === "Other" &&
                    detail.otherComplaintText && (
                      <> - {detail.otherComplaintText}</>
                    )}
                </Badge>
              </div>
            </div>

            <div className="mb-4 card">
              <div className="card-body">
                <small className="text-street-base d-block mb-2">
                  Description
                </small>
                <p className="mb-0">{detail.complaintDescription}</p>
              </div>
            </div>

            {/* Impact */}
            <div className="d-flex flex-column ">
              <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                <Icon icon="mdi:trending-up" width={18} />
                Impact
              </h6>
              <div className="border-danger card bg-danger bg-opacity-10 mb-4">
                <div className="card-body">
                  <p className="mb-0">{detail.impact}</p>
                </div>
              </div>
            </div>

            {/* Desired Outcome */}
            <div className="d-flex flex-column ">
              {" "}
              <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                <Icon icon="mdi:target" width={18} />
                Desired Outcome
              </h6>
              <div className="border-success card bg-success bg-opacity-10 mb-4">
                <div className="card-body">
                  <p className="mb-0">{detail.desiredOutcome}</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="d-flex justify-content-between align-items-center pt-3 border-top  text-street-base small">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="mdi:clock-outline" width={14} />
                Submitted: {formatDateTime(detail.createdAt)}
              </div>
            </div>
          </Container>
        </div>
      </ModalWrapper>
    </>
  );
};

export default ClientFeedback;
