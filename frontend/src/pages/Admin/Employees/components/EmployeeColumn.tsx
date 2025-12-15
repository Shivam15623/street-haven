import type { Column } from "../../../../components/child/DataTable";
import type { EmployeeData } from "../../../../services/EmployeeApi";
import userimage from "@assets/images/user.png";
import EditEmployee from "./EditEmployee";
import DeleteEmployee from "./DeleteEmployee";
import type { HasPermissionFn } from "../../../../hooks/Auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
export const EmployeeColumn = (
  hasPermission: HasPermissionFn
): Column<EmployeeData>[] => {
  const columns: Column<EmployeeData>[] = [
    {
      title: "Profile Pic",
      accessorKey: "profilePic",
      render: (row) => (
        <img
          src={row?.profilePic ?? userimage}
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

  // -----------------------------------
  // CHECK IF USER HAS ANY ACTION PERMISSION
  // -----------------------------------
  const canUpdate = hasPermission({ action: "edit_employee" });
  const canDelete = hasPermission({ action: "delete_employee" });

  // If at least one action is allowed → show Actions column
  if (canUpdate || canDelete) {
    columns.push({
      title: "Actions",
      sortable: false,
      render: (row) => (
        <div className="d-flex gap-2">
          {canUpdate && (
            <EditEmployee
              id={row._id}
              profilePic={row.profilePic}
              initialValues={{
                email: row.email,
                firstname: row.firstname,
                lastname: row.lastname,
                phoneNo: row.phoneNo,
                role: row.role,
                hireDate: row.hireDate,
                timePeriod: dayjs(row.hireDate).fromNow(),
                title: row.title,
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
        </div>
      ),
    });
  }

  return columns;
};
