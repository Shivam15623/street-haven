import { useState } from "react";
import { Badge, Col, Container, Row } from "react-bootstrap";
import { Icon } from "@iconify/react/dist/iconify.js";
import DOMPurify from "dompurify";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import type { StaffFeedbackData } from "../../../../../../interfaces/incidentReport";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import { useLazyGetStaffFeedbackPdfQuery } from "../../../../../../services/FormApi";

dayjs.extend(localizedFormat);

const formatDate = (date: string | Date) => dayjs(date).format("DD MMM YYYY");

const StaffFeedbackDetail = ({ detail }: { detail: StaffFeedbackData }) => {
  const [showModal, setShowModal] = useState(false);
  const [getStaffFeedbackPdf, { isFetching: pdfloading }] =
    useLazyGetStaffFeedbackPdfQuery();
  const handleDownload = async () => {
    try {
      const blob = await getStaffFeedbackPdf(detail._id).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "staff-feedback-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };
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
        title="Staff Feedback Details"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
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
        <Container className="d-flex flex-column gap-24 animate-fade-in">
          {/* Location & Date */}
          <Row className="g-3 mb-4">
            <Col md={6}>
              <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 border-sh-base-1-2">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                    <Icon icon="mdi:map-marker" width={16} />
                    <small className="text-uppercase fw-semibold">
                      Location
                    </small>
                  </div>
                  <p className="mb-0 fw-medium">{detail.location}</p>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 border-sh-base-1-2">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 text-street-base mb-1">
                    <Icon icon="mdi:calendar" width={16} />
                    <small className="text-uppercase fw-semibold">Date</small>
                  </div>
                  <p className="mb-0 fw-medium">{formatDate(detail.date)}</p>
                </div>
              </div>
            </Col>
          </Row>

          <hr />

          {/* Category */}
          <div>
            <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
              <Icon icon="mdi:tag-outline" width={18} />
              Category
            </h6>
            <Badge bg="secondary" className="px-3 py-2">
              {detail.category}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
              <Icon icon="mdi:clipboard-text-outline" width={18} />
              Description
            </h6>
            <div className="card">
              <div
                className="card-body"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(detail.description),
                }}
              />
            </div>
          </div>

          {/* Witnesses */}
          <div>
            <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
              <Icon icon="mdi:account-group-outline" width={18} />
              Witnesses
            </h6>

            {detail.witnesses?.length ? (
              <div className="d-flex flex-wrap gap-2">
                {detail.witnesses.map((w, idx) => (
                  <Badge key={idx} bg="secondary" className="px-3 py-2">
                    {w}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">No witnesses</p>
            )}
          </div>

          {/* Actions Taken */}
          {detail.actionsTaken && (
            <div>
              <h6 className="d-flex align-items-center gap-2 text-xs lg:text-sm mb-8">
                <Icon icon="mdi:clipboard-check-outline" width={18} />
                Actions Taken
              </h6>
              <div className="border-success card bg-success bg-opacity-10">
                <div className="card-body">
                  <p className="mb-0">{detail.actionsTaken}</p>
                </div>
              </div>
            </div>
          )}

          <hr />

          {/* Reporter Info */}
          <div>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <div className="h-100 d-flex flex-column p-16 radius-12 bg-neutral-50 border-sh-base-1-2">
                  <div className="card-body">
                    <small className="text-street-base d-block mb-1">
                      Submitted By
                    </small>
                    <p className="mb-0 fw-medium">
                      {detail.submittedBy.firstname}{" "}
                      {detail.submittedBy.lastname}
                      <br />
                      <small className="text-muted">
                        {detail.submittedBy.email}
                      </small>
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </ModalWrapper>
    </>
  );
};

export default StaffFeedbackDetail;
