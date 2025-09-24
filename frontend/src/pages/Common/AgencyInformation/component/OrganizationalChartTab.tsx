
import MobileTree from "./Organizational/MobileTree";
import TreeGraph from "./Organizational/OrganizationalChart";

const OrganizationalChartTab = () => {
  const OrganizationTree = [
    {
      levelName: "Executive Level",
      role: [
        {
          roleName: "Executive Director",
          department: "Administration",
          reportsTo: "Board of Directors",
          supervises: [
            "Program Directors",
            "Operations Manager",
            "Finance Manager",
          ],
        },
      ],
    },
    {
      levelName: "Management Level",
      role: [
        {
          roleName: "Clinical Director",
          department: "Clinical Services",
          reportsTo: "Executive Director",
          supervises: ["Clinical Supervisors", "Therapists", "Case Managers"],
        },
        {
          roleName: "Housing Program Manager",
          department: "Housing Services",
          reportsTo: "Executive Director",
          supervises: ["Housing Coordinators", "Support Workers"],
        },
        {
          roleName: "Executive Director",
          department: "Administration",
          reportsTo: "Executive Director",
          supervises: [
            "HR Specialist",
            "Facilities Coordinator",
            "Administrative Staff",
          ],
        },
        {
          roleName: "Finance Manager",
          department: "Finance & Administration",
          reportsTo: "Executive Director",
          supervises: ["Finance Assistant", "Development Coordinator"],
        },
      ],
    },
    {
      levelName: "Supervisory Level",
      role: [
        {
          roleName: "Clinical Supervisor",
          department: "Clinical Services",
          reportsTo: "Clinical Director",
          supervises: ["Licensed Therapists", "Peer Support Specialists"],
        },
        {
          roleName: "Housing Coordinator",
          department: "Housing Services",
          reportsTo: "Housing Program Manager",
          supervises: ["Housing Support Workers", "Intake Specialists"],
        },
      ],
    },
    {
      levelName: "Direct Service Level",
      role: [
        {
          roleName: "Case Managers",
          department: "Various Programs",
          reportsTo: "Program Supervisors",
        },
        {
          roleName: "Housing Coordinator",
          department: "Housing Services",
          reportsTo: "Program Coordinators",
        },
        {
          roleName: "Housing Coordinator",
          department: "Housing Services",
          reportsTo: "Operations Manager",
        },
      ],
    },
  ];
  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-20 radius-12">
        <h3 className="fw-bold text-md mb-0 sm:text-lg md:text-xl">
          Organizational Structure
        </h3>
        <div className="d-none d-sm-block">
          <TreeGraph />
        </div>
        <MobileTree />
      </div>
    </div>
  );
};

export default OrganizationalChartTab;
