import { Icon } from "@iconify/react";
import type { Column } from "../../../../components/child/DataTable";
import type { ITask } from "../../../../services/taskApi";
import Badge, { type BadgeVariant } from "../../../../components/child/Badge";
import TaskComment from "./TaskComment";
import {
  dueStatusLabel,
  dueStatusVariant,
  taskBadgeVariant,
  type DueStatus,
} from "../taskTable.types";
import useHasPermission from "../../../../hooks/Auth";
import { PERMISSIONS } from "../../../../utills/auth/permissions";

interface Params {
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  onView: (task: ITask) => void;
}

export const useTaskColumns = ({
  onEdit,
  onDelete,
  onView,
}: Params): Column<ITask>[] => {
  const { hasPermission } = useHasPermission();
  return [
    {
      title: "Task",
      accessorKey: "title",
      render: (row) => (
        <div className="d-flex flex-column flex-1 gap-1">
          <p className="text-xs xs:text-sm text-street-dark fw-semibold">
            {row.title}
          </p>
        </div>
      ),
    },
    {
      title: "Assigned To",
      sortable: false,
      render: (row) => (
        <>
          {row.assignedTo?.firstname} {row.assignedTo?.lastname}
        </>
      ),
    },
    {
      title: "Assigned By",
      sortable: false,
      render: (row) => (
        <>
          {row.assignedBy?.firstname} {row.assignedBy?.lastname}
        </>
      ),
    },
    {
      title: "Due Date",
      accessorKey: "dueDate",
      render: (row) => (
        <div className="d-flex flex-row gap-4">
          <span className="text-sm">
            {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-"}
          </span>
          {row.dueStatus && (
            <Badge
              variant={dueStatusVariant[row.dueStatus as DueStatus]}
              className="text-capitalize w-fit"
            >
              {dueStatusLabel[row.dueStatus as DueStatus]}
            </Badge>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      accessorKey: "status",
      render: (row) => (
        <Badge
          variant={taskBadgeVariant[row.status] as BadgeVariant}
          className="text-capitalize"
        >
          {row.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      title: "Created",
      accessorKey: "createdAt",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      title: "Updated",
      accessorKey: "updatedAt",
      render: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
    {
      title: "Actions",
      sortable: false,
      render: (row) => (
        <div className="d-flex align-items-center gap-1">
          {hasPermission({ action: PERMISSIONS.TASK_VIEW_SELF }) && (
            <button
              type="button"
              className="btn btn-sm btn-street-outline-primary radius-12 d-flex align-items-center justify-content-center p-0"
              style={{ width: "43px", height: "40px" }}
              title="View Details"
              onClick={() => onView(row)}
            >
              <Icon icon="lucide:eye" className="text-xl" />
            </button>
          )}
          {hasPermission({ action: PERMISSIONS.TASK_EDIT }) && (
            <button
              type="button"
              className="btn btn-sm btn-street-edit radius-12 d-flex align-items-center justify-content-center p-0"
              style={{ width: "43px", height: "40px" }}
              title="Edit Task"
              onClick={() => onEdit(row)}
            >
              <Icon icon="mdi:pencil-outline" className="text-xl" />
            </button>
          )}
          {hasPermission({ action: PERMISSIONS.TASK_DELETE }) && (
            <button
              type="button"
              className="btn btn-sm btn-street-delete radius-12 d-flex align-items-center justify-content-center p-0"
              style={{ width: "43px", height: "40px" }}
              title="Delete Task"
              onClick={() => onDelete(row)}
            >
              <Icon icon="mdi:delete-outline" className="text-xl" />
            </button>
          )}
          {hasPermission({ action: PERMISSIONS.TASK_VIEW_SELF }) && (
            <TaskComment task={row} />
          )}
        </div>
      ),
    },
  ];
};
