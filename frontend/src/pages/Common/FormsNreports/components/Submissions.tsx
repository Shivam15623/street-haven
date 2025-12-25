import StreetTab from "../../../../components/StreetTab";
import ClientFeedbackSubmission from "./forms/clientFeedback/submissions";
import ClientIncidentReportSubmission from "./forms/clientIncident/submissions";
import EmployeeIncidentReportSubmission from "./forms/employeeIncident/submissions";
import FunctionalAbilitiesSubmission from "./SubmissionTabs/FunctionalAbiltiesSubmission";
import IncidentReportSubmission from "./SubmissionTabs/IncidentReportSubmission";
import MediaConsentSubmission from "./SubmissionTabs/MediaConsentSubmission";
import PaymentRequistionSubmission from "./forms/paymentRequisition/PaymentRequistionSubmission";
import StaffFeedBackSubmission from "./SubmissionTabs/StaffFeedBackSubmission";

interface SubmissionsProps {
  activeKey: string;
  onTabChange?: (key: string) => void;
}

const Submissions: React.FC<SubmissionsProps> = ({
  activeKey,
  onTabChange,
}) => {
  return (
    <StreetTab
      defaultActiveKey="incident_report"
      activeKey={activeKey}
      onTabChange={onTabChange}
      tabs={[
        {
          key: "incident_report",
          label: "Incident Report Form Submission",
          content: <IncidentReportSubmission />,
        },
        {
          key: "staff_feedback",
          label: "Staff Feedback Form Submission",
          content: <StaffFeedBackSubmission />,
        },
        {
          key: "client_feedback",
          label: "Client Feedback Form Submission",
          content: <ClientFeedbackSubmission />,
        },
        {
          key: "client_incident_report",
          label: "Client Incident Report Form Submission",
          content: <ClientIncidentReportSubmission />,
        },
        {
          key: "employee_incident_report",
          label: "Employee Incident Report Form Submission",
          content: <EmployeeIncidentReportSubmission />,
        },
        {
          key: "payment_requisition",
          label: "Payment Requisition Form Submission",
          content: <PaymentRequistionSubmission />,
        },
        {
          key: "functional_ability",
          label: "Functional Ability Form Submission",
          content: <FunctionalAbilitiesSubmission />,
        },
        {
          key: "media_consent",
          label: "Media Consent Form Submission",
          content: <MediaConsentSubmission />,
        },
      ]}
    />
  );
};

export default Submissions;
