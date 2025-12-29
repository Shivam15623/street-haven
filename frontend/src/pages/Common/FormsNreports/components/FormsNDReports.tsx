
import StreetTab from "../../../../components/StreetTab";
import EmployeeIncidentForm from "./forms/employeeIncident/formTab";
import FunctionalAbiltiesForm from "./forms/FunctionalAbiltiesForm";
import MediaConsentForm from "./forms/MediaConsentForm";
import PaymentRequisition from "./forms/paymentRequisition/formTab";
import ClientIncidentFormTab from "./forms/clientIncident/formTab";
import ClientFeedbackFormTab from "./forms/clientFeedback/formTab";
import IncidentreportFormTab from "./forms/IncidentReport/IncidentreportForm";
import StaffFeedbackFormTab from "./forms/staffFeedback/formTab";

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
          content: <IncidentreportFormTab />,
        },
        {
          key: "staff_feedback",
          label: "Staff Feedback Form",
          content: <StaffFeedbackFormTab />,
        },
        {
          key: "client_feedback",
          label: "Client Feedback Form",
          content: <ClientFeedbackFormTab />,
        },
        {
          key: "client_incident_report",
          label: "Client Incident Report Form",
          content: <ClientIncidentFormTab />,
        },
        {
          key: "employee_incident_report",
          label: "Employee Incident Report Form",
          content: <EmployeeIncidentForm />,
        },
        {
          key: "payment_requisition",
          label: "Payment Requisition Form",
          content: <PaymentRequisition />,
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
