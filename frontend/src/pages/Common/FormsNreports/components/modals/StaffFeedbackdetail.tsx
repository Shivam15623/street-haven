import { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import type { StaffFeedbackData } from "../../../../../interfaces/incidentReport";
import DOMPurify from "dompurify";
const StaffFeedbackDetail = ({ detail }: { detail: StaffFeedbackData }) => {
  const [showModal, setShowModal] = useState(false);

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
        title="Staff Feedback Details"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
      >
        <div className="d-flex flex-column gap-3">
          {/* Basic Info */}
          <div className="d-flex flex-column gap-1">
            <label className="fw-bold">Date</label>
            <p>{detail.date}</p>
          </div>

          <div className="d-flex flex-column gap-1">
            <label className="fw-bold">Location</label>
            <p>{detail.location}</p>
          </div>

          <div className="d-flex flex-column gap-1">
            <label className="fw-bold">Category</label>
            <p>{detail.category}</p>
          </div>

          {/* Description */}
          <div className="d-flex flex-column gap-1">
            <label className="fw-bold">Description</label>
            <div
              className="parse Te"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(detail.description),
              }}
            />
          </div>

          {/* Witnesses */}
          <div className="d-flex flex-column gap-1">
            <label className="fw-bold">Witnesses</label>
            {detail.witnesses?.length > 0 ? (
              <ul className="ms-3">
                {detail.witnesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            ) : (
              <p>No witnesses</p>
            )}
          </div>

          {/* Actions Taken */}
          <div className="d-flex flex-column gap-1">
            <label className="fw-bold">Actions Taken</label>
            <p>{detail.actionsTaken}</p>
          </div>

          {/* Reporter */}
          <div className="d-flex flex-column gap-1">
            <label className="fw-bold">Reporter Name</label>
            <p>{detail.reporterName}</p>
          </div>

          {/* Submitted By */}
          <div className="d-flex flex-column gap-1">
            <label className="fw-bold">Submitted By</label>
            <p>
              {detail.submittedBy.firstname} {detail.submittedBy.lastname} (
              {detail.submittedBy.email})
            </p>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default StaffFeedbackDetail;
