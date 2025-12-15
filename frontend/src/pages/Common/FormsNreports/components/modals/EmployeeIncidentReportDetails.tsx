import React, { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import type { employeeIncidentReport } from "../../../../../services/FormApi";

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
    <div className="text-lg xl:text-xl mb-20 pb-20 border-bottom text-street-dark fw-semibold ">
      {title}
    </div>
    <div className="row g-3">{children}</div>
  </div>
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
          {/* Basic Info */}
          <Section title="🧑 Employee Information">
            <LabelValue label="Report Type" value={detail.reportType} />
            <LabelValue label="Employee Name" value={detail.name} />
            <LabelValue label="Job Title" value={detail.jobTitle} />
            <LabelValue label="Supervisor" value={detail.supervisor} />
            <LabelValue
              label="Informed Supervisor"
              value={detail.informedSupervisor ? "Yes" : "No"}
            />
          </Section>

          {/* Incident Details */}
          <Section title="📍 Incident Details">
            <LabelValue
              label="Injury Date"
              value={new Date(detail.injuryDate).toLocaleDateString("en-IN")}
            />
            <LabelValue label="Injury Time" value={detail.injuryTime} />
            <LabelValue label="Location" value={detail.location} />
            <LabelValue
              label="Activity at Time"
              value={detail.activityAtTime}
            />
            <LabelValue label="Description" value={detail.description} />
            <LabelValue
              label="Prevention Suggestion"
              value={detail.preventionSuggestion}
            />
            <LabelValue
              label="Injured Body Part / Risk"
              value={detail.injuredBodyPartOrRisk}
            />
          </Section>

          {/* Medical Info */}
          <Section title="🏥 Medical Information">
            <LabelValue
              label="Did Employee See a Doctor?"
              value={detail.sawDoctor ? "Yes" : "No"}
            />

            {detail.sawDoctor && (
              <>
                <LabelValue label="Doctor Name" value={detail.doctorName!} />
                <LabelValue label="Doctor Phone" value={detail.doctorPhone!} />
                <LabelValue
                  label="Doctor Visit Date"
                  value={
                    detail.doctorVisitDate
                      ? new Date(detail.doctorVisitDate).toLocaleDateString(
                          "en-IN"
                        )
                      : "N/A"
                  }
                />
                <LabelValue
                  label="Doctor Visit Time"
                  value={detail.doctorVisitTime!}
                />
              </>
            )}
          </Section>

          {/* Previous Injury Info */}
          <Section title="⚠️ Previous Injury">
            <LabelValue
              label="Previous Injury"
              value={detail.previousInjury ? "Yes" : "No"}
            />

            {detail.previousInjury && (
              <LabelValue
                label="Previous Injury Date"
                value={detail.previousInjuryDate || "N/A"}
              />
            )}
          </Section>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EmployeeIncidentReportDetails;
