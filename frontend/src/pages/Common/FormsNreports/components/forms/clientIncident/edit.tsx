import React, { useEffect, useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";

import {
  useEditClientIncidentMutation,

  useLazyGetClientIncidentByIdQuery,
  type clientIncidentReport,
  type editclientIncident,
} from "../../../../../../services/FormApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { FormValues } from "./form";
import ClientIncidentForm from "./form";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import { getErrorMessage } from "../../../../../../utills/utills";

interface EditClientIncidentProp {
  data: clientIncidentReport;
}
const EditClientIncident: React.FC<EditClientIncidentProp> = ({ data }) => {
  const [showModal, setShowModal] = useState(false);

  /** UPDATE mutation */
  const [updateIncident, { isLoading: isUpdating }] =
    useEditClientIncidentMutation();

  /** GET incident */

  const [getclientIncident, { data: incidentdata, isLoading: isFetching }] =
    useLazyGetClientIncidentByIdQuery();
  useEffect(() => {
    if (showModal) {
      getclientIncident({ id: data._id! });
    }
  }, [showModal, data._id, getclientIncident]);
  const incident = incidentdata?.data;
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
        id: incident!._id,
        data: payload,
      }).unwrap();
      if (res.success) {
        showSuccess("Client feedback updated successfully");
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
     showError(getErrorMessage(error));
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
        isLoading={isFetching || isUpdating}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={isFetching || isUpdating}
            variant="spinner"
            size="lg"
            message={
              isFetching
                ? "Loading incident details..."
                : "Updating incident..."
            }
          />
        }
         footer={
          <div className="d-flex justify-content-end ">
            <button
              className="btn btn-street-primary btn-street-lg radius-12"
              type="submit"
              form="edit-client-incident-form"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        }
      >
        {" "}
        {!isFetching && incident && (
          <ClientIncidentForm
            footer={false}
            id={"edit-client-incident-form"}
            isLoading={isUpdating}
            handleSubmit={handleSubmit}
            initialvalues={{
              date: new Date(incident.incidentDate),
              time: incident.incidentTime,
              place: incident.incidentPlace,
              affectedClientname: incident.affectedPerson,
              staffName: incident.staffName,
              WitnessName: incident.witnessName,
              staffEmail: incident.staffEmail,
              incidentType: incident.incidentType as
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
              otherIncidentDescription: incident.otherincidentText,
              incidentDescription: incident.incidentDescription,
              ActionTaken: incident.ActionTaken,
              debrief: incident.debrief,
              reportingStaffName: incident.reportingStaffName,
              reportedTo: incident.reportedTo,
              repotingDate: new Date(incident.reportingDate),
              reportedToDate: new Date(incident.reportedToDate),
              followUp: incident.followup,
            }}
          />
        )}
      </ModalWrapper>
    </>
  );
};

export default EditClientIncident;
