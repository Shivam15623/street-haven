import { useState } from "react";
import DeleteEmployee from "./DeleteEmployee";
import EditEmployee from "./EditEmployee";
import ResetTotp from "./ResetTotp";
import type { EmployeeData } from "../../../../services/EmployeeApi";
import ChangeEmployeePassword from "./ChangeEmployeePassword";
import { Icon } from "@iconify/react/dist/iconify.js";

interface EmployeeActionsProps {
  row: EmployeeData;
  canUpdate: boolean;
  canDelete: boolean;
  canChangePassword: boolean;
}

const EmployeeActions = ({
  row,
  canUpdate,
  canDelete,
  canChangePassword,
}: EmployeeActionsProps) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <div className="d-flex gap-2">
        {canUpdate && (
          <EditEmployee
            id={row._id}
            profilePic={row.profilePic ?? "assets/images/userlogo.png"}
            initialValues={{
              email: row.email,
              firstname: row.firstname,
              lastname: row.lastname,
              phoneNo: row.phoneNo,
              role: row.role,
              hireDate: row.hireDate,
              title: row.title,
              locations: row.locations,
              superviserId: row.superviserId,
              customPermissions: row.customPermissions,
            }}
          />
        )}

        {canDelete && (
          <DeleteEmployee
            employee={{
              email: row.email,
              firstname: row.firstname,
              lastname: row.lastname,
              role: row.role,
              _id: row._id,
            }}
          />
        )}

        {canDelete && (
          <ResetTotp
            employee={{
              _id: row._id,
              email: row.email,
              firstname: row.firstname,
              lastname: row.lastname,
            }}
          />
        )}

        {canChangePassword && (
          <button
            className="btn btn-sm btn-street-edit radius-12 d-flex align-items-center justify-content-center p-0"
            style={{ width: "43px", height: "40px" }}
            onClick={() => setShowPasswordModal(true)}
          >
            <Icon icon="solar:key-outline" className="text-xl" />
          </button>
        )}
      </div>

      {canChangePassword && (
        <ChangeEmployeePassword
          employeeId={row._id}
          showModal={showPasswordModal}
          setShowModal={setShowPasswordModal}
        />
      )}
    </>
  );
};
export default EmployeeActions;
