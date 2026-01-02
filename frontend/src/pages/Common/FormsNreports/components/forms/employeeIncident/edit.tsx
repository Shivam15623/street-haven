import React, { useState, useMemo, useEffect } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import { Icon } from "@iconify/react/dist/iconify.js";

import {
  useEditEmployeeIncidentMutation,

  useLazyGetEmployeeIncidentByIdQuery,
  type editemployeeIncidentReportCred,
} from "../../../../../../services/FormApi";

import EmployeeIncidentForm, { type FormValues } from "./form";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import { showError, showSuccess } from "../../../../../../utills/toastutills";

interface EditEmployeeIncidentProp {
  data: { _id: string }; // only need ID now
}

const EditEmployeeIncident: React.FC<EditEmployeeIncidentProp> = ({ data }) => {
  const [showModal, setShowModal] = useState(false);

  const [
    getEmployeeincident,
    { data: response, isLoading: isFetching, isFetching: isRefetching },
  ] = useLazyGetEmployeeIncidentByIdQuery();
  useEffect(() => {
    if (showModal) {
      getEmployeeincident({ id: data._id! });
    }
  }, [showModal, getEmployeeincident, data._id]);
  const [updateIncident, { isLoading }] = useEditEmployeeIncidentMutation();

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: editemployeeIncidentReportCred = {
        reportType: values.reportingFor!,
        employee: values.employeeId!,
        jobTitle: values.jobTitle!,
        supervisor: values.superviserId!,
        informedSupervisor: values.informedSuperviser,
        injuryDate: new Date(values.injuryDate),
        injuryTime: values.injuryTime,
        location: values.exactLocation,
        activityAtTime: values.activityAtTime,
        description: values.incidentDescription,
        preventionSuggestion: values.prevention,
        sawDoctor: values.doctorVisited,
        previousInjury: values.previousInjury,
      };

      if (values.witnessName) payload.witnessName = values.witnessName;
      if (values.injuredBodyParts) {
        payload.injuredBodyPartOrRisk = values.injuredBodyParts;
      }
      if (values.doctorVisited) {
        payload.doctorName = values.doctorName;
        payload.doctorPhone = values.doctorPhone;
        payload.doctorVisitDate = new Date(values.doctorVisitDate!);
        payload.doctorVisitTime = values.doctorVisitTime;
      }

      if (values.previousInjury) {
        payload.previousInjuryDate = new Date(values.previousInjuryDate!);
      }

      const res = await updateIncident({
        id: data._id,
        data: payload,
      }).unwrap();

      if (res.success) {
        showSuccess("Employee incident updated successfully");
        resetForm();
        setShowModal(false);
      }
    } catch (error: any) {
      showError(error?.message || "Update failed");
    }
  };

  const incident = response?.data;

  const initialValues = useMemo(() => {
    if (!incident) return null;

    return {
      reportingFor: incident.reportType,
      employeeId: incident.employee._id,
      employeeName: `${incident.employee.firstname} ${incident.employee.lastname}`,
      superviserId: incident.supervisor._id,
      superviserName: `${incident.supervisor.firstname} ${incident.supervisor.lastname}`,
      jobTitle: incident.jobTitle,
      informedSuperviser: incident.informedSupervisor,
      injuryDate: new Date(incident.injuryDate),
      injuryTime: incident.injuryTime,
      witnessName: incident.witnessName,
      exactLocation: incident.location,
      activityAtTime: incident.activityAtTime,
      incidentDescription: incident.description,
      prevention: incident.preventionSuggestion,
      injuredBodyParts: incident.injuredBodyPartOrRisk,
      doctorVisited: incident.sawDoctor,
      doctorName: incident.doctorName,
      doctorPhone: incident.doctorPhone,
      doctorVisitDate: incident.doctorVisitDate
        ? new Date(incident.doctorVisitDate)
        : new Date(),
      doctorVisitTime: "",
      previousInjury: incident.previousInjury,
      previousInjuryDate: incident.previousInjuryDate
        ? new Date(incident.previousInjuryDate)
        : new Date(),
    };
  }, [incident]);

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
        isLoading={isFetching || isRefetching || isLoading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={isFetching || isRefetching || isLoading}
            variant="spinner"
            size="lg"
            message={
              isFetching || isRefetching
                ? "Loading incident details"
                : "Submitting incident details"
            }
          />
        }
        footer={
          <button
            className="btn btn-street-primary btn-street-lg"
            type="submit"
            form="edit-employee-incident-form"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        }
      >
        {initialValues && (
          <EmployeeIncidentForm
            isActive={showModal}
            id="edit-employee-incident-form"
            initialvalues={initialValues}
            footer={false}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </ModalWrapper>
    </>
  );
};

export default EditEmployeeIncident;
