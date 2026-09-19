
import type { Column } from "../../../../components/child/DataTable";
import type { EmployeeData } from "../../../../services/EmployeeApi";


import type { HasPermissionFn } from "../../../../hooks/Auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import StatusToggle from "./StatusToggle";

import EmployeeActions from "./EmployeeAction";

dayjs.extend(relativeTime);

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export const EmployeeColumn = (
  hasPermission: HasPermissionFn,
): Column<EmployeeData>[] => {
  const columns: Column<EmployeeData>[] = [
    {
      title: "Profile Pic",
      accessorKey: "profilePic",
      render: (row) => (
        <img
          src={row?.profilePic || "assets/images/userlogo.png"}
          alt="User"
          className="rounded-circle w-48-px h-48-px"
        />
      ),
    },

    {
      title: "Full Name",
      accessorKey: "firstname",
      render: (row) => (
        <div>
          {row.firstname} {row.lastname}
        </div>
      ),
      sortable: true,
    },

    {
      title: "Email",
      accessorKey: "email",
      sortable: true,
    },

    {
      title: "Phone No",
      accessorKey: "phoneNo",
      sortable: true,
    },

    {
      title: "Role",
      accessorKey: "role",
      render: (row) => <div>{formatRole(row.role)}</div>,
    },
  ];

  const canUpdate = hasPermission({ action: "edit_employee" });
  const canDelete = hasPermission({ action: "delete_employee" });
  const canResetStatus = hasPermission({
    action: "employee_status_change",
  });
  const canChangePassword = hasPermission({
    action: "reset_password",
  });

  if (canResetStatus) {
    columns.push({
      title: "Status",
      accessorKey: "isActive",
      render: (row) => <StatusToggle id={row._id} status={row.status} />,
    });
  }

  if (canUpdate || canDelete || canChangePassword) {
    columns.push({
      title: "Actions",
      sortable: false,
      render: (row) => (
        <EmployeeActions
          row={row}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canChangePassword={canChangePassword}
        />
      ),
    });
  }

  return columns;
};
