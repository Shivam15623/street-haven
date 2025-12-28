import React, { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";

import { Icon } from "@iconify/react/dist/iconify.js";
import {
  useEditEmployeeIncidentMutation,
  type editemployeeIncidentReportCred,

  type EmployeeIncidentReportPopulated,
} from "../../../../../../services/FormApi";

import EmployeeIncidentForm, { type FormValues } from "./form";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
interface EditEmployeeIncidentProp {
  data: EmployeeIncidentReportPopulated;
}
const EditEmployeeIncident: React.FC<EditEmployeeIncidentProp> = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  const [updateIncident, { isLoading }] = useEditEmployeeIncidentMutation();
  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    console.log("Tottle");
    try {
      const payload: editemployeeIncidentReportCred = {
        reportType: values.reportingFor!,
        name: values.employeeId,
        jobTitle: values.jobTitle,
        supervisor: values.superviserId,
        informedSupervisor: values.informedSuperviser,
        injuryDate: new Date(values.injuryDate),
        injuryTime: values.injuryTime,
        location: values.exactLocation,
        activityAtTime: values.activityAtTime,
        description: values.incidentDescription,
        preventionSuggestion: values.prevention,
        injuredBodyPartOrRisk: values.injuredBodyParts,
        sawDoctor: values.doctorVisited,

        previousInjury: values.previousInjury,
      };

      if (values.witnessName) {
        payload.witnessName = values.witnessName;
      }
      if (values.doctorVisited === true) {
        payload.doctorName = values.doctorName;
        payload.doctorPhone = values.doctorPhone;
        payload.doctorVisitDate = new Date(values.doctorVisitDate!);
        payload.doctorVisitTime = values.doctorVisitTime;
      }
      if (payload.previousInjury === true) {
        payload.previousInjuryDate = new Date(values.previousInjuryDate!);
      }
      const res = await updateIncident({
        id: data._id,
        data: payload,
      }).unwrap();
      if (res.success) {
        showSuccess("employee incident Record updated successfully");
        resetForm();
        setShowModal(false);
      }
    } catch (error: any) {
      showError(`error:${error.message}`);
      console.log(error);
    }
  };
  const initialValues = {
    reportingFor: data.reportType,
    employeeName: `${data.employee.firstname} ${data.employee.lastname}`,
    jobTitle: data.jobTitle,
    superviserName: `${data.supervisor.firstname} ${data.supervisor.lastname}`,
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
      ? new Date(data.doctorVisitDate)
      : new Date(),
    doctorVisitTime: "",
    previousInjury: data.previousInjury,
    previousInjuryDate: new Date(),
  };
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
        isLoading={isLoading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={isLoading}
            variant="spinner"
            size="lg"
            message="Updating Incident Report"
          />
        }
        footer={
          <>
            <button
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center justify-content-center"
              type="submit"
              form="edit-employee-incident-form"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </>
        }
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
              initialvalues={initialValues}
              footer={false}
              id="edit-employee-incident-form"
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EditEmployeeIncident;
