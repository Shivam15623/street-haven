import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { Row, Col, Container } from "react-bootstrap";
import { useEffect, useState, type JSX } from "react";

import type { BadgeVariant } from "../../../../../../components/child/Badge";
import {
  useLazyGetClientIncidentByIdQuery,
  useLazyGetClientIncidentPdfQuery,
  type clientIncidentReport,
} from "../../../../../../services/FormApi";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import Badge from "../../../../../../components/child/Badge";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import { formatTime12Hour } from "../../../../../../utills/utills";

interface ClientIncidentModalProps {
  incident: clientIncidentReport;
}

const ClientIncidentReportDetail = ({ incident }: ClientIncidentModalProps) => {
  const [showModal, setShowModal] = useState(false);

  const [getclientIncident, { data: response, isLoading, isFetching }] =
    useLazyGetClientIncidentByIdQuery();
  useEffect(() => {
    if (showModal) {
      getclientIncident({ id: incident._id! });
    }
  }, [showModal, incident._id, getclientIncident]);

  const [getClientincidentPdf, { isFetching: pdfloading }] =
    useLazyGetClientIncidentPdfQuery();
  const handleDownload = async () => {
    try {
      const blob = await getClientincidentPdf(incident._id).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "client-incident-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  const detail = response?.data;
  const loading = isLoading || isFetching;

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
        isLoading={loading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={loading}
            variant="spinner"
            size="lg"
            message="Loading incident details..."
          />
        }
        footer={
          <div className="d-flex justify-content-end">
            {" "}
            <button
              className="d-flex gap-2 align-items-center btn-street-lg justify-content-center btn btn-street-outline-primary radius-12 p-0"
              onClick={handleDownload}
            >
              {" "}
              {pdfloading ? "Downloading..." : "Download"}
            </button>
          </div>
        }
      >
        {/* ✅ Render only when data is ready */}
        {!loading && detail && (
          <Container className="d-flex flex-column gap-24">
            {/* Incident Type */}
            <div className="p-3 rounded border border-danger bg-danger bg-opacity-10 mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-sm text-street-base">Incident Type</span>
                {getIncidentTypeBadge(detail.incidentType)}
              </div>

              {detail.incidentType === "Other" && detail.otherincidentText && (
                <p className="mt-2 mb-0 text-sm">{detail.otherincidentText}</p>
              )}
            </div>

            {/* Date / Time / Place */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <InfoCard
                  icon="lucide:calendar"
                  label="Date"
                  value={format(new Date(detail.incidentDate), "MMMM dd yyyy")}
                />
              </Col>
              <Col md={4}>
                <InfoCard
                  icon="lucide:clock"
                  label="Time"
                  value={formatTime12Hour(detail.incidentTime)}
                />
              </Col>
              <Col md={4}>
                <InfoCard
                  icon="lucide:map-pin"
                  label="Place"
                  value={detail.incidentPlace}
                />
              </Col>
            </Row>

            {/* People */}
            <Row className="g-3 mb-4">
              <Col md={6}>
                <InfoCard
                  icon="lucide:user"
                  label="Affected Person"
                  value={detail.affectedPerson}
                />
              </Col>
              <Col md={6}>
                <InfoCard
                  icon="lucide:user"
                  label="Staff Member"
                  value={`${detail.staffName} (${detail.staffEmail})`}
                />
              </Col>
            </Row>

            {detail.witnessName && (
              <InfoCard
                icon="lucide:eye"
                label="Witness"
                value={detail.witnessName}
              />
            )}

            <hr />

            {/* Description */}
            <Section
              icon="lucide:file-text"
              title="Incident Description"
              content={detail.incidentDescription}
            />

            <Section
              icon="lucide:check-circle-2"
              title="Action Taken"
              content={detail.ActionTaken}
              variant="success"
            />

            <Section
              icon="lucide:message-square"
              title="Debrief"
              content={detail.debrief}
              variant="primary"
            />

            <hr />

            {/* Reporting */}
            <Row className="g-3">
              <Col md={6}>
                <InfoCard
                  icon="lucide:user"
                  label="Reported By"
                  value={`${detail.reportingStaffName} (${format(
                    new Date(detail.reportingDate),
                    "MMM d, yyyy"
                  )})`}
                />
              </Col>
              <Col md={6}>
                <InfoCard
                  icon="lucide:send"
                  label="Reported To"
                  value={`${detail.reportedTo} (${format(
                    new Date(detail.reportedToDate),
                    "MMM d, yyyy"
                  )})`}
                />
              </Col>
            </Row>

            {detail.followup && (
              <Section
                icon="lucide:clipboard-list"
                title="Follow-up"
                content={detail.followup}
              />
            )}
          </Container>
        )}
      </ModalWrapper>
    </>
  );
};

export default ClientIncidentReportDetail;

/* ---------- Small helpers ---------- */

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div className="p-3 border rounded-3 card h-100">
    <div className="d-flex align-items-center gap-2 text-street-base mb-1">
      <Icon icon={icon} width={16} />
      <small>{label}</small>
    </div>
    <strong className="text-sm">{value}</strong>
  </div>
);

const Section = ({
  icon,
  title,
  content,
  variant,
}: {
  icon: string;
  title: string;
  content: string;
  variant?: "success" | "primary";
}) => {
  const bg =
    variant === "success"
      ? "bg-success bg-opacity-10 border-success"
      : variant === "primary"
      ? "bg-street-primary-10 border-sh-primary-50"
      : "border";

  return (
    <div className={`p-3 border rounded mb-3 ${bg}`}>
      <div className="d-flex align-items-center gap-2 mb-2">
        <Icon icon={icon} width={16} />
        <span className="fw-medium">{title}</span>
      </div>
      <p className="mb-0 text-sm">{content}</p>
    </div>
  );
};
