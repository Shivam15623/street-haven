import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { Badge, Col, Container, Row } from "react-bootstrap";
import { Icon } from "@iconify/react/dist/iconify.js";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import type { IncidentReport } from "../../../../../services/IncidentReportApi";
import { useState } from "react";

dayjs.extend(localizedFormat);

interface IncidentReportModalProps {
  incident: IncidentReport | null;
}

const formatDate = (date: string | Date) => dayjs(date).format("DD MMM YYYY");

const formatDateTime = (date: string | Date) =>
  dayjs(date).format("DD MMM YYYY, h:mm A");

const IncidentReportModal = ({ incident }: IncidentReportModalProps) => {
  const [showModal, setShowModal] = useState(false);
  if (!incident) return null;

  return (
    <>
      <button
        className="btn btn-street-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12 gap-2"
        onClick={() => setShowModal(true)}
      >
        View Details
      </button>
      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        title="Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Container className="d-flex flex-column gap-24 animate-fade-in">
            {/* Header Info */}

            {/* Location & Date */}
            <Row className="g-3 mb-4">
              <Col md={6}>
                <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                      <Icon icon="mdi:map-marker" width={16} />
                      <small className="text-uppercase fw-semibold">
                        Location
                      </small>
                    </div>
                    <p className="mb-0 fw-medium">{incident.location}</p>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                      <Icon icon="mdi:calendar" width={16} />
                      <small className="text-uppercase fw-semibold">
                        Date of Incident
                      </small>
                    </div>
                    <p className="mb-0 fw-medium">
                      {formatDate(incident.dateOfIncident)}
                    </p>
                  </div>
                </div>
              </Col>
            </Row>

            <hr />

            {/* Description */}
            <div>
              <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                <Icon icon="mdi:clipboard-check-outline" width={18} />
                Description
              </h6>
              <div className=" card">
                <div className="card-body">
                  <p className="mb-0">{incident.description}</p>
                </div>
              </div>
            </div>

            {/* Witnesses */}
            {incident.witnesses?.length > 0 && (
              <div>
                <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                  <Icon icon="mdi:account-group-outline" width={18} />
                  Witnesses ({incident.witnesses.length})
                </h6>
                <div className="d-flex flex-wrap gap-2 ">
                  {incident.witnesses.map((witness, index) => (
                    <Badge key={index} bg="secondary" className="px-3 py-2">
                      {witness}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Taken */}
            {incident.actionsTaken && (
              <div>
                <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                  <Icon icon="mdi:clipboard-text-outline" width={18} />
                  Actions Taken
                </h6>
                <div className="border-success card bg-success bg-opacity-10 ">
                  <div className="card-body">
                    <p className="mb-0">{incident.actionsTaken}</p>
                  </div>
                </div>
              </div>
            )}

            <hr />

            {/* Reporter Info */}
            <div>
              <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                <Icon icon="mdi:account" width={18} />
                Reporter Information
              </h6>

              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                    <div className="card-body">
                      <small className="text-street-base d-block mb-1">
                        Reporter Name
                      </small>
                      <p className="mb-0 fw-medium">{incident.reporterName}</p>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 shadow-none border-sh-base-1-2 ">
                    <div className="card-body">
                      <small className="text-street-base d-block mb-1">
                        Submitted By (User ID)
                      </small>
                      <p className="mb-0 font-monospace">
                        {incident.submittedBy.firstname}{" "}
                        {incident.submittedBy.lastname}
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Timestamps */}
            <div className="d-flex justify-content-between align-items-center pt-3 border-top text-street-base small">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="mdi:clock-outline" width={14} />
                Created: {formatDateTime(incident.createdAt)}
              </div>
              <div>Updated: {formatDateTime(incident.updatedAt)}</div>
            </div>
          </Container>
        </div>
      </ModalWrapper>
    </>
  );
};

export default IncidentReportModal;
