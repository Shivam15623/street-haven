import type { Column } from "../../../../components/child/DataTable";
import type { EmployeeData } from "../../../../services/EmployeeApi";
import userimage from "@assets/images/user.png";
import EditEmployee from "./EditEmployee";
import DeleteEmployee from "./DeleteEmployee";

export const EmployeeColumn: Column<EmployeeData>[] = [
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
    title: "id",
    accessorKey: "slug",
    sortable: true,
  },
  {
    title: "Fullname",
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
  },
  {
    title: "Actions",
    sortable: false, // actions column is not sortable
    render: (row) => (
      <div className="d-flex gap-2">
        <EditEmployee
          id={row._id}
          profilePic={row.profilePic}
          initialValues={{
            email: row.email,
            firstname: row.firstname,
            lastname: row.lastname,
            phoneNo: row.phoneNo,
          }}
        />
        <DeleteEmployee
          employee={{
            email: row.email,
            firstname: row.firstname,
            lastname: row.lastname,
            role: row.role,
            _id: row._id,
          }}
        />
      </div>
    ),
  },
];
