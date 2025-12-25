import React, { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";

import {
  useEditClientIncidentMutation,
  type clientIncidentReport,
  type editclientIncident,
} from "../../../../../../services/FormApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { FormValues } from "./form";
import ClientIncidentForm from "./form";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";

interface EditClientIncidentProp {
  data: clientIncidentReport;
}
const EditClientIncident: React.FC<EditClientIncidentProp> = ({ data }) => {
  const [updateIncident, { isLoading }] = useEditClientIncidentMutation();
  const [showModal, setShowModal] = useState(false);
  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: editclientIncident = {
        incidentDate: new Date(values.date),
        incidentTime: values.time,
        incidentPlace: values.place,
        incidentType: values.incidentType,
        affectedPerson: values.affectedClientname,
        staffName: values.staffName,
        staffEmail: values.staffEmail,
        witnessName: values.WitnessName,
        otherincidentText: values.otherIncidentDescription,
        incidentDescription: values.incidentDescription,
        ActionTaken: values.ActionTaken,
        debrief: values.debrief,
        reportingStaffName: values.reportingStaffName,
        reportedTo: values.reportedTo,
        reportingDate: values.repotingDate,
        followup: values.followUp,
        reportedToDate: values.reportedToDate,
      };
      const res = await updateIncident({
        id: data._id,
        data: payload,
      }).unwrap();
      if (res.success) {
        showSuccess("Client feedback updated successfully");
        resetForm();
        setShowModal(false);
      }
    } catch (error: any) {
      showError(error?.message || "Update failed");
    }
  };
  return (
    <>
      {" "}
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
        title="Client Incident Report"
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
            message="Updating feedback"
          />
        }
        footer={
          <>
            <button
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center justify-content-center"
              type="submit"
              form="edit-client-incident-form"
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
            <ClientIncidentForm
              footer={false}
              id={"edit-client-incident-form"}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              initialvalues={{
                date: new Date(data.incidentDate),
                time: data.incidentTime,
                place: data.incidentPlace,
                affectedClientname: data.affectedPerson,
                staffName: data.staffName,
                WitnessName: data.witnessName,
                staffEmail: data.staffEmail,
                incidentType: data.incidentType as
                  | "Disaster"
                  | "Drugs"
                  | "Property Destruction"
                  | "Theft"
                  | "Medical / Injury / Health Emergency"
                  | "Intruders"
                  | "Police Action"
                  | "Actual Physical / Sexual Violence"
                  | "Threat of Physical / Sexual Violence"
                  | "Bomb Threat"
                  | "Other"
                  | "", // allow empty initially
                otherIncidentDescription: data.otherincidentText,
                incidentDescription: data.incidentDescription,
                ActionTaken: data.ActionTaken,
                debrief: data.debrief,
                reportingStaffName: data.reportingStaffName,
                reportedTo: data.reportedTo,
                repotingDate: new Date(data.reportingDate),
                reportedToDate: new Date(data.reportedToDate),
                followUp: data.followup,
              }}
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EditClientIncident;
