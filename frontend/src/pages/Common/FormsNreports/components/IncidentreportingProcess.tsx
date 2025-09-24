import React from "react";
import IncidentStep from "./IncidentStep";

const steps = [
  {
    step: 1,
    title: "Report Immediately",
    description: "Submit within 24 hours",
  },
  {
    step: 2,
    title: "Auto-Notification",
    description: "Supervisor & HR notified",
  },
  { step: 3, title: "Investigation", description: "Follow-up within 48 hours" },
  { step: 4, title: "Resolution", description: "Action plan implemented" },
];

const IncidentReportingProcess: React.FC = () => {
  return (
    <div className="p-24 d-flex flex-column bg-street-blueblur rounded-3 mb-4 gap-20">
      <h3 className="text-md fw-semibold text-street-primary mb-0">
        Incident Reporting Process
      </h3>
      <div className="container max-w-1200-px mx-auto">
        <div className="row g-4 justify-content-center justify-content-md-between">
          {steps.map(({ step, title, description }) => (
            <div key={step} className="col-12 col-sm-6  col-lg-3">
              <IncidentStep
                step={step}
                title={title}
                description={description}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncidentReportingProcess;
