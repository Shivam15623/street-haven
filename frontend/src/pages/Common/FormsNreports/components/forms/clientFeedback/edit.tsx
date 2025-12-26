import { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";

import { showError, showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import {
  useEditClientFeedBackMutation,
  type clientFeedbackData,
  type editclientFeedbackCredentials,
} from "../../../../../../services/FormApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import ClientFeedBackForm, { type FormValues } from "./form";

interface EditClientFeedbackProps {
  data: clientFeedbackData; // existing feedback record
}

const EditClientFeedback = ({ data }: EditClientFeedbackProps) => {
  const [updateFeedback, { isLoading }] = useEditClientFeedBackMutation();
  const [showModal, setShowModal] = useState(false);
  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {

      const payload: editclientFeedbackCredentials = {
        visitDate: new Date(values.date),
        visitLocation: values.location,
        clientName: values.name ? values.name : null,
        clientEmail: values.email ? values.email : null,
        clientPhone: values.phone ? values.phone : null,
        clientAddress: values.address ? values.address : null,
        preferredContactMethod: values.preferredContactMethod,
        complaintNature: values.natureOfComplaint,
        complaintDescription: values.description,
        desiredOutcome: values.desiredOutcome,
        impact: values.impact,
      };
      if (
        values.otherComplaintDescription &&
        values.natureOfComplaint === "Other"
      ) {
        payload.otherComplaintText = values.otherComplaintDescription;
      }
      const res = await updateFeedback({
        id: data._id,
        data: payload,
      }).unwrap();
      if (res.success) {
        showSuccess("Client feedback updated successfully");
        resetForm();
        setShowModal(false);
      }
    } catch (err: any) {
      showError(err?.message || "Update failed");
    }
  };

  if (!data) return null;

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
        title="Edit Client Feedback"
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
              form="edit-client-feedback-form"
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
            <ClientFeedBackForm
              id="edit-client-feedback-form"
              footer={false}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              initialvalues={{
                date: new Date(data.visitDate),
                location: data.visitLocation,
                name: data.clientName,
                phone: data.clientPhone,
                email: data.clientEmail,
                address: data.clientAddress,
                natureOfComplaint: data.complaintNature,
                otherComplaintDescription: data.otherComplaintText,
                description: data.complaintDescription,
                impact: data.impact,
                desiredOutcome: data.desiredOutcome,
                preferredContactMethod: data.preferredContactMethod,
              }}
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EditClientFeedback;
