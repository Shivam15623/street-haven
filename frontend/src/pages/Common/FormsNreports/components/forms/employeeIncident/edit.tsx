import React, { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";

import { Icon } from "@iconify/react/dist/iconify.js";
import type { employeeIncidentReport } from "../../../../../../services/FormApi";

import EmployeeIncidentForm from "./form";
interface EditEmployeeIncidentProp {
  data: employeeIncidentReport;
}
const EditEmployeeIncident: React.FC<EditEmployeeIncidentProp> = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  const initialValues={
                reportingFor: data.reportType,
                employeeName: data.name,
                jobTitle: data.jobTitle,
                superviserName: data.supervisor,
                informedSuperviser: data.informedSupervisor,
                injuryDate: new Date(data.injuryDate),
                injuryTime: data.injuryTime,
                witnessName: data.witnessName,
                exactLocation: data.location,
                activityAtTime: data.activityAtTime,
                incidentDescription: data.description,
                prevention: data.preventionSuggestion,
                injuredBodyParts: data.injuredBodyPartOrRisk,
                doctorVisited: data.sawDoctor,
                doctorName: data.doctorName,
                doctorPhone: data.doctorPhone,
                doctorVisitDate: data.doctorVisitDate
                doctorVisitTime: "",
                previousInjury: data.previousInjury,
                previousInjuryDate: new Date().toISOString(),
              }
  return (
    <>
      <button
        className="btn btn-sm btn-street-edit radius-12 d-flex align-items-center justify-content-center p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
      >
        <Icon icon="tabler:edit" className="text-xl" />
      </button>
      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        title="Employee Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 gap-16"
        bodyClassName="p-0 d-flex flex-column gap-16"
        footerClassName="pt-16 px-0 pb-0"
      >
        <div
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
          }}
        >
          <div className="py-16">
            {" "}
            <EmployeeIncidentForm
              initialvalues={{
                reportingFor: data.reportType,
                employeeName: data.name,
                jobTitle: data.jobTitle,
                superviserName: data.supervisor,
                informedSuperviser: data.informedSupervisor,
                injuryDate: new Date(data.injuryDate),
                injuryTime: data.injuryTime,
                witnessName: data.witnessName,
                exactLocation: data.location,
                activityAtTime: data.activityAtTime,
                incidentDescription: data.description,
                prevention: data.preventionSuggestion,
                injuredBodyParts: data.injuredBodyPartOrRisk,
                doctorVisited: data.sawDoctor,
                doctorName: data.doctorName,
                doctorPhone: data.doctorPhone,
                doctorVisitDate: data.doctorVisitDate? new Date(data.doctorVisitDate):new(),
                doctorVisitTime: "",
                previousInjury: data.previousInjury,
                previousInjuryDate: new Date().toISOString(),
              }}
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EditEmployeeIncident;
