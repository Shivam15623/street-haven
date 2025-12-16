import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { Row, Col, Container } from "react-bootstrap";
import type { clientIncidentReport } from "../../../../../services/FormApi";
import Badge, {
  type BadgeVariant,
} from "../../../../../components/child/Badge";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { useState, type JSX } from "react";

interface ClientIncidentModalProps {
  incident: clientIncidentReport | null;
}

export function ClientIncidentReportDetail({
  incident,
}: ClientIncidentModalProps) {
  const [showModal, setShowModal] = useState(false);
  if (!incident) return null;

  const getIncidentTypeBadge = (type: string): JSX.Element => {
    const severityMap: Record<string, BadgeVariant> = {
      Disaster: "danger",
      Drugs: "warning",
      "Property Destruction": "warning",
      Theft: "warning",
      "Medical / Injury / Health Emergency": "danger",
      Intruders: "danger",
      "Police Action": "danger",
      "Actual Physical / Sexual Violence": "danger",
      "Threat of Physical / Sexual Violence": "danger",
      "Bomb Threat": "danger",
      Other: "secondary",
    };

    return <Badge variant={severityMap[type] ?? "secondary"}>{type}</Badge>;
  };

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
        title="Client Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32"
        bodyClassName="p-0"
      >
        <div className="py-3" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Container className="d-flex flex-column gap-24 ">
            {/* Incident Type */}
            <div className="p-3 rounded border border-danger bg-danger bg-opacity-10 mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-sm text-street-base">Incident Type</span>
                {getIncidentTypeBadge(incident.incidentType)}
              </div>
              {incident.incidentType === "Other" &&
                incident.otherincidentText && (
                  <p className="mt-2 mb-0 text-sm">
                    {incident.otherincidentText}
                  </p>
                )}
            </div>

            {/* Date / Time / Place */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <div className="p-3 border rounded h-100">
                  <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                    <Icon icon="lucide:calendar" width={16} />
                    <small>Date</small>
                  </div>
                  <strong>
                    {format(new Date(incident.incidentDate), "MMM d, yyyy")}
                  </strong>
                </div>
              </Col>
              <Col md={4}>
                <div className="p-3 border rounded h-100">
                  <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                    <Icon icon="lucide:clock" width={16} />
                    <small>Time</small>
                  </div>
                  <strong>{incident.incidentTime}</strong>
                </div>
              </Col>
              <Col md={4}>
                <div className="p-3 border rounded h-100">
                  <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                    <Icon icon="lucide:map-pin" width={16} />
                    <small>Place</small>
                  </div>
                  <strong className="text-sm">{incident.incidentPlace}</strong>
                </div>
              </Col>
            </Row>

            {/* People */}
            <Row className="g-3 mb-4">
              <Col md={6}>
                <div className="p-3 border card rounded-3 h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Icon icon="lucide:user" width={16} />
                    <span className="fw-medium">Affected Person</span>
                  </div>
                  <p className="fw-semibold mb-0">{incident.affectedPerson}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 border card rounded-3 h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Icon icon="lucide:user" width={16} />
                    <span className="fw-medium">Staff Member</span>
                  </div>
                  <p className="fw-semibold mb-0">{incident.staffName}</p>
                  <small className="text-street-base d-flex align-items-center gap-1 mt-1">
                    <Icon icon="lucide:mail" width={14} />
                    {incident.staffEmail}
                  </small>
                </div>
              </Col>
            </Row>

            {/* Witness */}
            {incident.witnessName && (
              <div className="p-3 border card rounded-3 d-flex flex-row align-items-center  gap-2 mb-4">
                <Icon icon="lucide:eye" width={16} />
                <span>
                  Witness: <strong>{incident.witnessName}</strong>
                </span>
              </div>
            )}

            <hr />

            {/* Details */}
            <div className="mt-4">
              <div className="p-3 border card rounded-3 mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Icon icon="lucide:file-text" width={16} />
                  <span className="fw-medium">Incident Description</span>
                </div>
                <p className="mb-0 text-sm">{incident.incidentDescription}</p>
              </div>

              <div className="p-3 border border-success bg-success bg-opacity-10 rounded mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Icon
                    icon="lucide:check-circle-2"
                    width={16}
                    className="text-success"
                  />
                  <span className="fw-medium text-success">Action Taken</span>
                </div>
                <p className="mb-0 text-sm">{incident.ActionTaken}</p>
              </div>

              <div className="p-16 border rounded-3  border-sh-primary-50 bg-street-primary-10 ">
                <div className="d-flex align-items-center  gap-2 mb-2">
                  <Icon
                    icon="lucide:message-square"
                    width={16}
                    className="text-street-primary"
                  />
                  <span className="fw-medium text-street-primary">Debrief</span>
                </div>
                <p className="mb-0 text-sm">{incident.debrief}</p>
              </div>
            </div>

            <hr className="my-4" />

            {/* Reporting */}
            <h6 className="d-flex align-items-center gap-2 mb-3">
              <Icon icon="lucide:clipboard-list" width={16} />
              Reporting Details
            </h6>

            <Row className="g-3">
              <Col md={6}>
                <div className="p-3 border card rounded-3">
                  <p className="fw-semibold mb-1">
                    {incident.reportingStaffName}
                  </p>
                  <small className="text-street-base d-flex align-items-center gap-1">
                    <Icon icon="lucide:calendar" width={14} />
                    {format(new Date(incident.reportingDate), "MMM d, yyyy")}
                  </small>
                </div>
              </Col>
              <Col md={6}>
               <div className="p-3 border card rounded-3">
                  <p className="fw-semibold mb-1">{incident.reportedTo}</p>
                  <small className="text-street-base d-flex align-items-center gap-1">
                    <Icon icon="lucide:calendar" width={14} />
                    {format(new Date(incident.reportedToDate), "MMM d, yyyy")}
                  </small>
                </div>
              </Col>
            </Row>

            {/* Follow-up */}
            {incident.followup && (
              <div className="bg-neutral-50 border-sh-base-1-2 rounded-3 shadow-none mt-2 card p-16">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Icon icon="lucide:clipboard-list" width={16} />
                  <span className="fw-medium">Follow-up</span>
                </div>
                <p className="mb-0 text-sm">{incident.followup}</p>
              </div>
            )}
          </Container>
        </div>
      </ModalWrapper>
    </>
  );
}
export default ClientIncidentReportDetail;
