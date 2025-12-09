import React, { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import type { clientIncidentReport } from "../../../../../services/FormApi";

const LabelValue = ({ label, value }: { label: string; value: string }) => (
  <div className="col-md-4 d-flex flex-column gap-1 mb-3">
    <div className="text-sm text-street-base">{label}</div>
    <div className="text-sm text-street-dark">{value || "N/A"}</div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="p-16">
    <div className="text-lg xl:text-xl mb-3">{title}</div>
    <div className="row g-3">{children}</div>
  </div>
);

const ClientIncidentReportDetail = ({
  detail,
}: {
  detail: clientIncidentReport;
}) => {
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
        title="Client Incident Report Details"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16"
        bodyClassName="p-0 d-flex flex-column gap-16"
        footerClassName="pt-16 px-0 pb-0"
        onHide={() => setShowModal(false)}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Incident Basic Info */}
          <Section title="📅 Incident Information">
            <LabelValue
              label="Incident Date"
              value={new Date(detail.incidentDate).toLocaleDateString("en-IN")}
            />
            <LabelValue label="Incident Time" value={detail.incidentTime} />
            <LabelValue label="Incident Place" value={detail.incidentPlace} />
            <LabelValue label="Incident Type" value={detail.incidentType} />
            {detail.incidentType === "Other" && (
              <LabelValue
                label="If Other (Specify)"
                value={detail.otherincidentText!}
              />
            )}

            <LabelValue label="Affected Person" value={detail.affectedPerson} />
          </Section>

          {/* Staff & Witness Info */}
          <Section title="🧑‍🤝‍🧑 Staff & Witness Information">
            <LabelValue label="Staff Name" value={detail.staffName} />
            <LabelValue label="Staff Email" value={detail.staffEmail} />
            <LabelValue label="Witness Name" value={detail.witnessName} />
          </Section>

          {/* Description & Actions */}
          <Section title="📝 Incident Notes">
            <LabelValue
              label="Incident Description"
              value={detail.incidentDescription}
            />
            <LabelValue label="Action Taken" value={detail.ActionTaken} />
            <LabelValue label="Debrief" value={detail.debrief} />
          </Section>

          {/* Reporting Info */}
          <Section title="📢 Reporting Information">
            <LabelValue
              label="Reporting Staff Name"
              value={detail.reportingStaffName}
            />
            <LabelValue label="Reported To" value={detail.reportedTo} />
            <LabelValue label="Follow Up" value={detail.followup} />
            <LabelValue
              label="Reporting Date"
              value={
                detail.reportingDate
                  ? new Date(detail.reportingDate).toLocaleDateString("en-IN")
                  : "N/A"
              }
            />
            <LabelValue
              label="Reported To Date"
              value={new Date(detail.reportedToDate).toLocaleDateString(
                "en-IN"
              )}
            />
          </Section>
        </div>
      </ModalWrapper>
    </>
  );
};

export default ClientIncidentReportDetail;
