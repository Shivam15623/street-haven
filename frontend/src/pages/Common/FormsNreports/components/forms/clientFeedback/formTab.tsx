import {
  useCreateClientFeedbackMutation,
  type ClientFeedbackCredentials,
} from "../../../../../../services/FormApi";
import { showError, showSuccess } from "../../../../../../utills/toastutills";

import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import ClientFeedBackForm, { type FormValues } from "./form";

const ClientFeedbackFormTab = () => {
  const [createFeedback, { isLoading }] = useCreateClientFeedbackMutation();

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: ClientFeedbackCredentials = {
        date: new Date(values.date),
        location: values.location,
        type: values.natureOfComplaint ?? "",
        description: values.description,
        impact: values.impact,
        outcome: values.desiredOutcome,
        preferredContactMethod: values.preferredContactMethod,
      };

      // Optional fields mapping
      if (values.name) payload.clientName = values.name;
      if (values.phone) payload.clientPhone = values.phone;
      if (values.email) payload.clientEmail = values.email;
      if (values.address) payload.clientAddress = values.address;

      // "Other" complaint description
      if (
        values.natureOfComplaint === "Other" &&
        values.otherComplaintDescription
      ) {
        payload.otherComplaint = values.otherComplaintDescription;
      }

      const res = await createFeedback(payload).unwrap();
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
    <div className=" d-flex flex-column gap-24 ">
      {/* Header */}
      <div className="card">
        <div className="card-body d-flex flex-row gap-20 align-items-center">
          <img src="/assets/images/shForm.png" width={144} height={113} />
          <div className="d-flex flex-column">
            <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-2">
              Client Feedback Form
            </h4>
            <p className="text-md text-street-dark fw-semibold">
              Thank you for visiting Street Haven. We value all our clients and
              strive to meet everyone’s needs.
            </p>
          </div>
        </div>
      </div>

      {/* Formik */}
      <ClientFeedBackForm
        footer={true}
        handleSubmit={handleSubmit}
        initialvalues={{
          date: new Date().toISOString(), // string (YYYY-MM-DD)
          location: "",
          name: "",
          phone: "",
          email: "",
          address: "",
          natureOfComplaint: "Other",
          otherComplaintDescription: "",
          description: "",
          impact: "",
          desiredOutcome: "",
          preferredContactMethod: "Either",
        }}
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

export default ClientFeedbackFormTab;
