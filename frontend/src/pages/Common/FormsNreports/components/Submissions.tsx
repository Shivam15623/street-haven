import StreetTab from "../../../../components/StreetTab";
import ClientFeedbackSubmission from "./forms/clientFeedback/submissions";
import ClientIncidentReportSubmission from "./forms/clientIncident/submissions";
import EmployeeIncidentReportSubmission from "./forms/employeeIncident/submissions";
import FunctionalAbilitiesSubmission from "./SubmissionTabs/FunctionalAbiltiesSubmission";
import IncidentReportSubmission from "./forms/IncidentReport/submissions";
import MediaConsentSubmission from "./SubmissionTabs/MediaConsentSubmission";
import PaymentRequistionSubmission from "./forms/paymentRequisition/submissions";
import StaffFeedBackSubmission from "./forms/staffFeedback/submissions";

interface SubmissionsProps {
  activeKey: string;
  onTabChange?: (key: string) => void;
  isViewActive: boolean;
}

const Submissions: React.FC<SubmissionsProps> = ({
  activeKey,
  isViewActive,
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
          content: (
            <IncidentReportSubmission
              isActive={activeKey === "incident_report" && isViewActive}
            />
          ),
        },
        {
          key: "staff_feedback",
          label: "Staff Feedback Form Submission",
          content: (
            <StaffFeedBackSubmission
              isActive={activeKey === "staff_feedback" && isViewActive}
            />
          ),
        },
        {
          key: "client_feedback",
          label: "Client Feedback Form Submission",
          content: (
            <ClientFeedbackSubmission
              isActive={activeKey === "client_feedback" && isViewActive}
            />
          ),
        },
        {
          key: "client_incident_report",
          label: "Client Incident Report Form Submission",
          content: (
            <ClientIncidentReportSubmission
              isActive={activeKey === "client_incident_report" && isViewActive}
            />
          ),
        },
        {
          key: "employee_incident_report",
          label: "Employee Incident Report Form Submission",
          content: (
            <EmployeeIncidentReportSubmission
              isActive={
                activeKey === "employee_incident_report" && isViewActive
              }
            />
          ),
        },
        {
          key: "payment_requisition",
          label: "Payment Requisition Form Submission",
          content: (
            <PaymentRequistionSubmission
              isActive={activeKey === "payment_requisition" && isViewActive}
            />
          ),
        },
        {
          key: "functional_ability",
          label: "Functional Ability Form Submission",
          content: (
            <FunctionalAbilitiesSubmission
              isActive={activeKey === "functional_ability" && isViewActive}
            />
          ),
        },
        {
          key: "media_consent",
          label: "Media Consent Form Submission",
          content: (
            <MediaConsentSubmission
              isActive={activeKey === "media_consent" && isViewActive}
            />
          ),
        },
      ]}
    />
  );
};

export default Submissions;
