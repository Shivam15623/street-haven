import StaffFeedbackForm from "./StaffFeedbackForm";
import IncidentreportForm from "./IncidentreportForm";
import StreetTab from "../../../../components/StreetTab";
import ClientFeedbackForm from "./forms/clientFeedback/formTab";
import EmployeeIncidentForm from "./forms/employeeIncident/formTab";
import PaymentRequisitionForm from "./forms/paymentRequisition/PaymentRequisitionForm";
import ClientIncidentForm from "./forms/clientIncident/formTab";
import FunctionalAbiltiesForm from "./forms/FunctionalAbiltiesForm";
import MediaConsentForm from "./forms/MediaConsentForm";

interface FormsNDReportsProps {
  activeKey: string;
  onTabChange?: (key: string) => void;
}

const FormsNDReports: React.FC<FormsNDReportsProps> = ({
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
          label: "Incident Reporting Form",
          content: <IncidentreportForm />,
        },
        {
          key: "staff_feedback",
          label: "Staff Feedback Form",
          content: <StaffFeedbackForm />,
        },
        {
          key: "client_feedback",
          label: "Client Feedback Form",
          content: <ClientFeedbackForm />,
        },
        {
          key: "client_incident_report",
          label: "Client Incident Report Form",
          content: <ClientIncidentForm />,
        },
        {
          key: "employee_incident_report",
          label: "Employee Incident Report Form",
          content: <EmployeeIncidentForm />,
        },
        {
          key: "payment_requisition",
          label: "Payment Requisition Form",
          content: <PaymentRequisitionForm />,
        },
        {
          key: "functional_ability",
          label: "Functional Abilities Form",
          content: <FunctionalAbiltiesForm />,
        },
        {
          key: "media_consent",
          label: "Media Consent Form",
          content: <MediaConsentForm />,
        },
      ]}
    />
  );
};

export default FormsNDReports;
