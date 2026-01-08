import { useCreateIncidentReportMutation } from "../../../../../../services/IncidentReportApi";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import IncidentReportForm, { type FormValues } from "./form";
import { getErrorMessage } from "../../../../../../utills/utills";

const IncidentreportFormTab = () => {
  const [createIncidentReport, { isLoading }] =
    useCreateIncidentReportMutation();

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const tempDate = new Date(values.date).toISOString().split("T")[0];
      const fullDateTime = new Date(`${tempDate}T${values.time}`).toISOString();

      const payload = {
        ...values,
        date: fullDateTime, // full ISO timestamp
      };

      const res = await createIncidentReport(payload).unwrap();
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
      {" "}
      <div className="card">
        <div className="card-body  d-flex flex-column gap-12 gap-sm-16 gap-md-20 rounded-3 p-16 p-sm-20 p-md-24">
          <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-0">
            Incident Reporting Form
          </h4>
          <IncidentReportForm
            footer={true}
            handleSubmit={handleSubmit}
            initialvalues={{
              date: new Date(),
              time: "",
              location: "",
              description: "",
              witnesses: [] as string[],
              actionsTaken: "",
              newWitness: "",
            }}
            isLoading={isLoading}
          />
        </div>
      </div>
      <FormSubmissionLoader
        isLoading={isLoading}
        size="lg"
        variant="spinner"
        message="Please Wait"
        subMessage="Processing Your Request Please Wait"
      />
    </>
  );
};

export default IncidentreportFormTab;
