import AddEmployee from "./components/AddEmployee";
import AddRole from "./components/AddRole";
import useHasPermission from "../../../hooks/Auth";
import StreetTab from "../../../components/StreetTab";
import EmployeesTab from "./components/EmployeesTab";
import RolesTab from "./components/RolesTab";

const Employees = () => {
  const { hasPermission } = useHasPermission();

  return (
    <div className="d-flex flex-column gap-18">
      <div className="card">
        <div className="card-body p-16 p-sm-20 radius-12 p-md-24 d-flex flex-row justify-content-between align-items-center">
          <div className="d-flex flex-column gap-2">
            <h3 className="text-xl mb-0 text-street-dark fw-semibold">
              Employees
            </h3>
            <p className="text-sm mb-0 text-street-base fw-normal">
              Manage your team members and their roles
            </p>
          </div>
          <div className="d-flex flex-row gap-2">
            {hasPermission({ moduleKey: "employees", action: "create" }) && (
              <AddEmployee />
            )}

            <AddRole />
          </div>
        </div>
      </div>
      <StreetTab
        tabs={[
          { key: "employees", label: "Employees", content: <EmployeesTab /> },
          { key: "roles", label: "Roles", content: <RolesTab /> },
        ]}
      />
    </div>
  );
};

export default Employees;
