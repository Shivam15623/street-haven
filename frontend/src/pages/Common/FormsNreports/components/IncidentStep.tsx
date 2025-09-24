import React from "react";

interface IncidentStepProps {
  step: number;
  title: string;
  description: string;
}

const IncidentStep: React.FC<IncidentStepProps> = ({ step, title, description }) => {
  return (
    <div className="d-flex flex-column gap-12">
      <div className="mx-auto rounded-circle w-40-px h-40-px bg-street-primary p-10 d-flex align-items-center justify-content-center text-white">
        {step}
      </div>
      <div className="text-center">
        <p className="fw-semibold text-sm text-street-primary mb-1">{title}</p>
        <p className="fw-normal text-xs text-street-primary">{description}</p>
      </div>
    </div>
  );
};

export default IncidentStep;
