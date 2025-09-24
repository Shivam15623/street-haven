import React from 'react'
import StaffFeedbackForm from './StaffFeedbackForm'
import IncidentreportForm from './IncidentreportForm'
import StreetTab from '../../../../components/StreetTab'

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
  )
}

export default FormsNDReports