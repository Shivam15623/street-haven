import {
  useCreateClientincidentMutation,
  type ClientIncidentCredentials,
} from "../../../../../../services/FormApi";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import ClientIncidentForm, { type FormValues } from "./form";
import { getErrorMessage } from "../../../../../../utills/utills";

const ClientIncidentFormTab = () => {
  const [createIncident, { isLoading }] = useCreateClientincidentMutation();
  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: ClientIncidentCredentials = {
        date: values.date,
        place: values.place,
        action: values.ActionTaken,
        type: values.incidentType,
        time: values.time,
        witnessName: values.WitnessName, // ✅ FIXED
        affectedClient: values.affectedClientname,
        debrief: values.debrief,
        description: values.incidentDescription,
        reportingStaffName: values.reportingStaffName,
        reportedTo: values.reportedTo,
        staffEmail: values.staffEmail,
        staffName: values.staffName,
        followUp: values.followUp,
        reportedToDate: values.reportedToDate,
        reportingDate: values.repotingDate,

        // ✅ You forgot these:
      };

      if (values.incidentType === "Other" && values.otherIncidentDescription) {
        payload.otherincidentType = values.otherIncidentDescription;
      }

      const res = await createIncident(payload).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (error: unknown) {
      showError(getErrorMessage(error));
    }
  };

  const initialValues: FormValues = {
    date: new Date(),
    time: "",
    place: "",
    affectedClientname: "",
    staffName: "",
    WitnessName: "",
    staffEmail: "",
    incidentType: "" as
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
    otherIncidentDescription: "",
    incidentDescription: "",
    ActionTaken: "",
    debrief: "",
    reportingStaffName: "",
    reportedTo: "",
    repotingDate: new Date(),
    reportedToDate: new Date(),
    followUp: "",
  };

  return (
    <div className="d-flex flex-column gap-24 ">
      <div className="card">
        <div className="card-body d-flex flex-row gap-20 align-items-center">
          <img src="/assets/images/shForm.png" width={144} height={113} />
          <div className="d-flex flex-column">
            <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-2">
              Client Incident Reporting Form
            </h4>
            <p className="text-md text-street-dark fw-semibold">
              Thank you for visiting Street Haven. We value all our clients and
              strive to meet everyone’s needs.
            </p>
          </div>
        </div>
      </div>

      <ClientIncidentForm
        initialvalues={initialValues}
        handleSubmit={handleSubmit}
        footer={true}
        isLoading={isLoading}
      />
      <FormSubmissionLoader
        isLoading={isLoading}
        size="lg"
        variant="spinner"
        message="Please Wait"
        subMessage="Processing Your Request Please Wait"
      />
    </div>
  );
};

export default ClientIncidentFormTab;
