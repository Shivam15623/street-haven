import { useEffect, useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import { Icon } from "@iconify/react";
import {
  useEditClientFeedBackMutation,
  useLazyGetClientFeedbackByIdQuery,
  type clientFeedbackData,
  type editclientFeedbackCredentials,
} from "../../../../../../services/FormApi";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import ClientFeedBackForm, { type FormValues } from "./form";

interface EditClientFeedbackProps {
  data: clientFeedbackData;
}

const EditClientFeedback = ({ data }: EditClientFeedbackProps) => {
  const [showModal, setShowModal] = useState(false);

  /** UPDATE */
  const [updateFeedback, { isLoading: isUpdating }] =
    useEditClientFeedBackMutation();

  /** FETCH */
  const [
    getfeedbackData,
    { data: feedbackResponse, isLoading: isFetching, isFetching: isRefetching },
  ] = useLazyGetClientFeedbackByIdQuery();
  useEffect(() => {
    if (showModal) {
      getfeedbackData({ id: data._id });
    }
  }, [showModal, data._id, getfeedbackData]);

  const feedback = feedbackResponse?.data;
  const loading = isFetching || isRefetching || isUpdating;

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: editclientFeedbackCredentials = {
        visitDate: new Date(values.date),
        visitLocation: values.location,
        clientName: values.name || null,
        clientEmail: values.email || null,
        clientPhone: values.phone || null,
        clientAddress: values.address || null,
        preferredContactMethod: values.preferredContactMethod as (
          | "Phone"
          | "Email"
        )[],
        complaintNature: values.natureOfComplaint,
        complaintDescription: values.description,
        desiredOutcome: values.desiredOutcome,
        impact: values.impact,
      };

      if (
        values.natureOfComplaint === "Other" &&
        values.otherComplaintDescription
      ) {
        payload.otherComplaintText = values.otherComplaintDescription;
      }

      const res = await updateFeedback({
        id: feedback!._id,
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
        isLoading={loading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={loading}
            variant="spinner"
            size="lg"
            message={
              isFetching || isRefetching
                ? "Loading feedback details..."
                : "Updating feedback..."
            }
          />
        }
        footer={
          <button
            className="btn btn-street-primary btn-street-lg radius-12"
            type="submit"
            form="edit-client-feedback-form"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        }
      >
        {/* ✅ Render only when data is ready */}
        {!isFetching && feedback && (
          <ClientFeedBackForm
            id="edit-client-feedback-form"
            footer={false}
            handleSubmit={handleSubmit}
            isLoading={isUpdating}
            initialvalues={{
              date: new Date(feedback.visitDate),
              location: feedback.visitLocation,
              name: feedback.clientName,
              phone: feedback.clientPhone,
              email: feedback.clientEmail,
              address: feedback.clientAddress,
              natureOfComplaint: feedback.complaintNature,
              otherComplaintDescription: feedback.otherComplaintText,
              description: feedback.complaintDescription,
              impact: feedback.impact,
              desiredOutcome: feedback.desiredOutcome,
              preferredContactMethod: feedback.preferredContactMethod ?? [],
            }}
          />
        )}
      </ModalWrapper>
    </>
  );
};

export default EditClientFeedback;
