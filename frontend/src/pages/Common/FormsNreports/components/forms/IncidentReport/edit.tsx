import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import { useEditIncidentReportMutation } from "../../../../../../services/IncidentReportApi";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import type { FormValues } from "./form";
import IncidentReportForm from "./form";
import type { IncidentReportData } from "../../../../../../interfaces/incidentReport";
import { getErrorMessage } from "../../../../../../utills/utills";

const EditIncidentReport = ({ data }: { data: IncidentReportData }) => {
  const [showModal, setShowModal] = useState(false);
  const [editIncident, { isLoading }] = useEditIncidentReportMutation();
  const initialValues = {
    date: new Date(data.dateOfIncident),
    time: new Date(data.dateOfIncident).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    location: data.location,
    description: data.description,
    witnesses: data.witnesses ? data.witnesses : ([] as string[]),
    actionsTaken: data.actionsTaken,

    newWitness: "",
  };
  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const tempDate = new Date(values.date).toISOString().split("T")[0];
      const fullDateTime = new Date(`${tempDate}T${values.time}`);

      const payload = {
        ...values,
        date: fullDateTime, // full ISO timestamp
      };

      const res = await editIncident({
        id: data._id,
        credentials: payload,
      }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (error) {
      showError(getErrorMessage(error));
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
          <div className="d-flex justify-content-end ">
            <button
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center justify-content-center"
              type="submit"
              form="edit-incident-report-form"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        }
      >
        <IncidentReportForm
          footer={false}
          handleSubmit={handleSubmit}
          initialvalues={initialValues}
          isLoading={isLoading}
          id="edit-incident-report-form"
        />
      </ModalWrapper>
    </>
  );
};

export default EditIncidentReport;
