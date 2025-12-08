import StreetTab from "../../../../components/StreetTab";
import ClientFeedbackSubmission from "./SubmissionTabs/ClientFeedbackSubmission";
import ClientIncidentReportSubmission from "./SubmissionTabs/ClientIncidentReportSubmission";
import EmployeeIncidentReportSubmission from "./SubmissionTabs/EmployeeIncidentReportSubmisiion";
import FunctionalAbilitiesSubmission from "./SubmissionTabs/FunctionalAbiltiesSubmission";
import IncidentReportSubmission from "./SubmissionTabs/IncidentReportSubmission";
import MediaConsentSubmission from "./SubmissionTabs/MediaConsentSubmission";
import PaymentRequistionSubmission from "./SubmissionTabs/PaymentRequistionSubmission";
import StaffFeedBackSubmission from "./SubmissionTabs/StaffFeedBackSubmission";

const Submissions = () => {
  return (
    <StreetTab
      defaultActiveKey="incident_report_submission"
      tabs={[
        {
          key: "incident_report_submission",
          content: <IncidentReportSubmission />,
          label: "Incident Report Form Submission",
        },
        {
          key: "staff_feedback_submission",
          content: <StaffFeedBackSubmission />,
          label: "Staff Feedback Form Submission",
        },

        {
          key: "client_feedback_submission",
          content: <ClientFeedbackSubmission />,
          label: "Client Feedback Form Submission",
        },
        {
          key: "client_incident_report_submission",
          content: <ClientIncidentReportSubmission />,
          label: "Client Incident Report Form Submission",
        },
        {
          key: "employee_incident_report_submission",
          content: <EmployeeIncidentReportSubmission />,
          label: "Employee Incident Report Form Submission",
        },
        {
          key: "payment_requisition_submission",
          content: <PaymentRequistionSubmission />,
          label: "Payment Requisition Form Submission",
        },
        {
          key: "functional_ability_form_submission",
          content: <FunctionalAbilitiesSubmission />,
          label: "Functional Ability Form Submission",
        },
        {
          key: "media_consent_form_submission",
          content: <MediaConsentSubmission />,
          label: "Media Consent Form Submission",
        },
      ]}
    />
  );
};

export default Submissions;
