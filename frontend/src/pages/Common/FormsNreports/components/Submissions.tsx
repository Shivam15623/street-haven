
import StreetTab from "../../../../components/StreetTab";
import IncidentReportSubmission from "./SubmissionTabs/IncidentReportSubmission";
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
      ]}
    />
  );
};

export default Submissions;
