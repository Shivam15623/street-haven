import { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEditStaffReportMutation } from "../../../../../../services/StaffFeedbackApi";
import StaffFeedbackForm, { type FormValues } from "./form";
import type { StaffFeedbackData } from "../../../../../../interfaces/incidentReport";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import { getErrorMessage } from "../../../../../../utills/utills";

const EditStaffFeedback = ({ data }: { data: StaffFeedbackData }) => {
  const [showModal, setShowModal] = useState(false);
  const [editStaff, { isLoading }] = useEditStaffReportMutation();
  const initialValues = {
    date: new Date(data.date),
    time: new Date(data.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    location: data.location,
    description: data.description,
    witnesses: data.witnesses ? data.witnesses : ([] as string[]),
    actionsTaken: data.actionsTaken,
    category: data.category,
    newWitness: "",
  };
  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      // combine date and time if needed

      const tempDate = new Date(values.date).toISOString().split("T")[0];
      const fullDateTime = new Date(`${tempDate}T${values.time}`);

      const payload = {
        ...values,
        date: fullDateTime, // full ISO timestamp
      };

      const res = await editStaff({
        id: data._id,
        credentials: payload,
      }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (err) {
      showError(getErrorMessage(err));
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
              form="edit-staff-report-form"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </>
        }
      >
        <StaffFeedbackForm
          footer={false}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          initialvalues={initialValues}
          id="edit-staff-report-form"
        />
      </ModalWrapper>
    </>
  );
};

export default EditStaffFeedback;
