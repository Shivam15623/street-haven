import {
  useCreateEmployeeIncidentMutation,
  type EmployeeIncidentCredentials,
} from "../../../../../../services/FormApi";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import EmployeeIncidentForm, { type FormValues } from "./form";

const EmployeeIncidentFormTab = () => {
  const [createIncident, { isLoading }] = useCreateEmployeeIncidentMutation();

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: EmployeeIncidentCredentials = {
        type: values.reportingFor,
        name: values.employeeName,
        jobTitle: values.jobTitle,
        supervisor: values.superviserName,
        informedSupervisor: values.informedSuperviser,
        injuryDate: values.injuryDate,
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
        payload.doctorVisitDate = values.doctorVisitDate;
        payload.doctorVisitTime = values.doctorVisitTime;
      }
      if (values.previousInjury === true && values.previousInjuryDate) {
        payload.previousInjuryDate = new Date(values.previousInjuryDate);
      }
      const res = await createIncident(payload).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      showError(err.message ?? "Something went wrong");
    }
  };

  return (
    <div className="d-flex flex-column gap-24 ">
      <div className="card">
        <div className="card-body d-flex flex-row gap-20 align-items-center">
          <img src="/assets/images/shForm.png" width={144} height={113} />
          <div className="d-flex flex-column">
            <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-2">
              Employee Incident Form
            </h4>
            <p className="text-md text-street-dark fw-semibold">
              Thank you for visiting Street Haven. We value all our clients and
              strive to meet everyone’s needs.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ FORM START */}
      <EmployeeIncidentForm
        isLoading={isLoading}
        footer={true}
        handleSubmit={handleSubmit}
        initialvalues={{
          reportingFor: "Illness",
          employeeName: "",
          jobTitle: "",
          superviserName: "",
          informedSuperviser: false,
          injuryDate: new Date(),
          injuryTime: "",
          witnessName: "",
          exactLocation: "",
          activityAtTime: "",
          incidentDescription: "",
          prevention: "",
          injuredBodyParts: "",
          doctorVisited: false,
          doctorName: "",
          doctorPhone: "",
          doctorVisitDate: new Date(),
          doctorVisitTime: "",
          previousInjury: false,
          previousInjuryDate: new Date().toISOString(),
        }}
      />
      <FormSubmissionLoader
        isLoading={isLoading}
        size="lg"
        variant="spinner"
        message="Please Wait"
        subMessage="Processing Your Request Please Wait"
      />
      {/* FORM END */}
    </div>
  );
};

export default EmployeeIncidentFormTab;
