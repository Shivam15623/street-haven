import { useState } from "react";
import { Badge, Col, Container, Row } from "react-bootstrap";
import { Icon } from "@iconify/react";
import localizedFormat from "dayjs/plugin/localizedFormat";
import dayjs from "dayjs";

import {
  useGetClientFeedbackByIdQuery,
  useLazyGetClientFeedbackPdfQuery,
  type clientFeedbackData,
} from "../../../../../../services/FormApi";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";

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

const getContactIcon = (methods?: string[]) => {
  if (!methods || methods.length === 0) return "mdi:help-circle-outline";

  if (methods.includes("Phone") && methods.includes("Email")) {
    return "mdi:swap-horizontal"; // both
  }

  if (methods.includes("Phone")) return "mdi:phone";
  if (methods.includes("Email")) return "mdi:email-outline";

  return "mdi:help-circle-outline";
};

const formatDate = (date: string | Date) => dayjs(date).format("DD MMM YYYY");

const formatDateTime = (date: string | Date) =>
  dayjs(date).format("DD MMM YYYY, h:mm A");

const ClientFeedback = ({ detail }: { detail: clientFeedbackData }) => {
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isFetching } = useGetClientFeedbackByIdQuery(
    { id: detail._id },
    { skip: !showModal }
  );

  const [getClientFeddbackPdf, { isFetching: pdfloading }] =
    useLazyGetClientFeedbackPdfQuery();
  const handleDownload = async () => {
    try {
      const blob = await getClientFeddbackPdf(detail._id).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "client-feedback-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  const detailData = data?.data;
  const loading = isLoading || isFetching;

  const hasClientInfo =
    detailData?.clientName ||
    detailData?.clientPhone ||
    detailData?.clientEmail ||
    detailData?.clientAddress;

  return (
    <>
      <button
        className="btn btn-street-primary d-flex text-sm align-items-center justify-content-center radius-12 gap-2"
        onClick={() => setShowModal(true)}
      >
        View Details
      </button>

      <ModalWrapper
        show={showModal}
        title="Client Feedback Report Details"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
        isLoading={loading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={loading}
            variant="spinner"
            size="lg"
            message="Loading feedback details..."
          />
        }
        footer={
          <button
            className="d-flex gap-2 align-items-center btn-street-lg justify-content-center btn btn-street-outline-primary radius-12 p-0"
       
            onClick={handleDownload}
          >
            {" "}
            {pdfloading ? "fetching" : "download"}
          </button>
        }
      >
        {/* ✅ Render only when data is ready */}
        {!loading && detailData && (
          <Container className="animate-fade-in d-flex flex-column gap-24">
            {/* Visit Info */}
            <Row className="g-3 mb-4">
              <Col md={6}>
                <div className="p-16 radius-12 bg-neutral-50 border-sh-base-1-2">
                  <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                    <Icon icon="mdi:calendar" width={16} />
                    <small className="fw-semibold text-uppercase">
                      Visit Date
                    </small>
                  </div>
                  <p className="mb-0 fw-medium">
                    {formatDate(detailData.visitDate)}
                  </p>
                </div>
              </Col>

              <Col md={6}>
                <div className="p-16 radius-12 bg-neutral-50 border-sh-base-1-2">
                  <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                    <Icon icon="mdi:map-marker" width={16} />
                    <small className="fw-semibold text-uppercase">
                      Visit Location
                    </small>
                  </div>
                  <p className="mb-0 fw-medium">{detailData.visitLocation}</p>
                </div>
              </Col>
            </Row>

            {/* Client Information */}
            {hasClientInfo && (
              <>
                <hr />
                <h6 className="d-flex align-items-center gap-2 text-sm mb-3">
                  <Icon icon="mdi:account" width={18} />
                  Client Information
                </h6>

                <Row className="g-3 mb-4">
                  {detailData.clientName && (
                    <Col md={6}>
                      <InfoCard
                        icon="mdi:account-outline"
                        label="Name"
                        value={detailData.clientName}
                      />
                    </Col>
                  )}

                  {detailData.clientPhone && (
                    <Col md={6}>
                      <InfoCard
                        icon="mdi:phone"
                        label="Phone"
                        value={detailData.clientPhone}
                      />
                    </Col>
                  )}

                  {detailData.clientEmail && (
                    <Col md={6}>
                      <InfoCard
                        icon="mdi:email-outline"
                        label="Email"
                        value={detailData.clientEmail}
                      />
                    </Col>
                  )}

                  {detailData.clientAddress && (
                    <Col md={6}>
                      <InfoCard
                        icon="mdi:home-outline"
                        label="Address"
                        value={detailData.clientAddress}
                      />
                    </Col>
                  )}

                  {detailData.preferredContactMethod?.length > 0 && (
                    <Col md={6}>
                      <div className="p-16 radius-12 bg-neutral-50 border-sh-base-1-2">
                        <div className="d-flex align-items-center gap-2 text-street-base mb-2">
                          <Icon
                            icon={getContactIcon(
                              detailData.preferredContactMethod
                            )}
                            width={14}
                          />
                          <small>Preferred Contact Method</small>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          {detailData.preferredContactMethod.map((method) => (
                            <Badge
                              key={method}
                              bg="secondary"
                              className="px-3 py-2 rounded-pill text-xs"
                            >
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </>
            )}

            <hr />

            {/* Complaint Details */}
            <div>
              <small className="text-street-base d-block mb-2">
                Nature of Complaint
              </small>
              <Badge
                bg={getComplaintBadgeVariant(detailData.complaintNature)}
                className="px-3 py-2 rounded-pill"
              >
                {detailData.complaintNature}
                {detailData.complaintNature === "Other" &&
                  detailData.otherComplaintText && (
                    <> - {detailData.otherComplaintText}</>
                  )}
              </Badge>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <small className="text-street-base d-block mb-2">
                  Description
                </small>
                <p className="mb-0">{detailData.complaintDescription}</p>
              </div>
            </div>

            <div className="pt-3 border-top text-street-base small d-flex gap-2">
              <Icon icon="mdi:clock-outline" width={14} />
              Submitted: {formatDateTime(detailData.createdAt)}
            </div>
          </Container>
        )}
      </ModalWrapper>
    </>
  );
};

/* 🔹 Reusable Info Card */
const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div className="p-16 radius-12 bg-neutral-50 border-sh-base-1-2">
    <div className="d-flex align-items-center gap-2 text-street-base mb-1">
      <Icon icon={icon} width={14} />
      <small>{label}</small>
    </div>
    <p className="mb-0 fw-medium">{value}</p>
  </div>
);

export default ClientFeedback;
