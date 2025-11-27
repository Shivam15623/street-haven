import StaffFeedbackForm from "./StaffFeedbackForm";
import IncidentreportForm from "./IncidentreportForm";
import StreetTab from "../../../../components/StreetTab";
import ClientFeedbackForm from "./forms/ClientFeedbackForm";
import EmployeeIncidentForm from "./forms/EmployeeIncidentForm";
import PaymentRequisitionForm from "./forms/PaymentRequisitionForm";
import ClientIncidentForm from "./forms/ClientIncidentForm";
import FunctionalAbiltiesForm from "./forms/FunctionalAbiltiesForm";
import MediaConsentForm from "./forms/MediaConsentForm";

const FormsNDReports = () => {
  return (
    <StreetTab
      defaultActiveKey="staff_feedback"
      tabs={[
        {
          label: "Staff Feedback Form",
          key: "staff_feedback",
          content: <StaffFeedbackForm />,
        },
        {
          label: "Incident Reporting Form",
          key: "incident_feedback",
          content: <IncidentreportForm />,
        },
        {
          label: "Client Feedback Form",
          key: "client_feedback",
          content: <ClientFeedbackForm />,
        },
        {
          label: "Employee Incident Report Form",
          key: "employee_incident_report",
          content: <EmployeeIncidentForm />,
        },
        {
          label: "Payment Requistion Form",
          key: "payment_requistion",
          content: <PaymentRequisitionForm />,
        },
        {
          label: "Client Incident Report Form",
          key: "client_incident_report",
          content: <ClientIncidentForm />,
        },
        {
          label: "Functional Abilities Form",
          key: "functional_abilties_form",
          content: <FunctionalAbiltiesForm />,
        },
        {
          label: "Media Consent Form",
          key: "media_consent",
          content: <MediaConsentForm />,
        },
        // {
        //   label: "Functional Abilities Form",
        //   key: "functional_abilties",
        //   content: <FunctionalAbiltiesTab />,
        // },
        // {
        //   label: "Incident Report",
        //   key: "incident_report",
        //   content: <IncidentReportTab/>,
        // },
        // {
        //   label: "Supervisor's Accident Report",
        //   key: "supervisor_accident_report",
        //   content: <>dd</>,
        // },
        // {
        //   label: "Fire Incident Form ",
        //   key: "fire_incident",
        //   content: <>dd</>,
        // },
        // {
        //   label: "Payment Requisition",
        //   key: "payment_requisition",
        //   content: <>dd</>,
        // },
        // {
        //   label: "Milege and Parking Reimbursement Form",
        //   key: "milege_and_parking_reimbursement",
        //   content: <ReimbursementTab/>,
        // },
      ]}
    />
  );
};

export default FormsNDReports;
