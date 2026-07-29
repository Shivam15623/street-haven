import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  useGetAllTasksQuery,
  type ITask,
  type TaskStatus,
} from "../../../../services/taskApi";
import type { Column } from "../../../../components/child/DataTable";
import DataTable from "../../../../components/child/DataTable";
import TaskComment from "./TaskComment";

const TaskTable = ({
  onEdit,
  onDelete,
}: {
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useGetAllTasksQuery({
    page,
    limit,
    search,
    sortBy,
    order,
  });

  const columns: Column<ITask>[] = [
    {
      title: "Task",

      render: (row) => {
        return (
          <div className="d-flex flex-column flex-1 gap-1">
            <p className="text-xs xs:text-sm text-street-dark fw-semibold">
              {row.title}
            </p>
          </div>
        );
      },

      accessorKey: "title",
    },
    {
      title: "Assigned To",
      render: (row) => (
        <>
          {row.assignedTo?.firstname} {row.assignedTo?.lastname}
        </>
      ),
      sortable: false,
    },
    {
      title: "Assigned By",
      render: (row) => (
        <>
          {row.assignedBy?.firstname} {row.assignedBy?.lastname}
        </>
      ),
      sortable: false,
    },
    {
      title: "Due Date",
      render: (row) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-",
      sortable: false,
    },
    {
      title: "Status",
      accessorKey: "status",
      render: (row) => {
        const badgeClass: Record<TaskStatus, string> = {
          assigned: "bg-warning",
          under_review: "bg-info",
          completed: "bg-success",
        };

        return (
          <span className={`badge ${badgeClass[row.status]}`}>
            {row.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      title: "Actions",
      sortable: false,
      render: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-light" title="View">
            <Icon icon="mdi:eye-outline" width={18} />
          </button>

          <button
            className="btn btn-sm btn-light"
            title="Edit"
            onClick={() => onEdit(row)}
          >
            <Icon icon="mdi:pencil-outline" width={18} />
          </button>

          <button
            className="btn btn-sm btn-light text-danger"
            onClick={() => onDelete(row)}
            title="Delete"
          >
            <Icon icon="mdi:delete-outline" width={18} />
          </button>
          <TaskComment task={row} />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data?.data.tasks ?? []}
      total={data?.data.total ?? 0}
      page={page}
      limit={limit}
      sortBy={sortBy}
      order={order}
      onLimitChange={(value) => {
        setLimit(value);
        setPage(1);
      }}
      onPageChange={setPage}
      onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
      }}
      onSortChange={(field, direction) => {
        setSortBy(field);
        setOrder(direction);
      }}
    />
  );
};

export default TaskTable;
