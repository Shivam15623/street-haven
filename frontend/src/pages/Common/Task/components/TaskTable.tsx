import { useMemo, useState } from "react";
import {
  useGetAllTasksQuery,
  type ITask,
  type TaskStatus,
} from "../../../../services/taskApi";
import DataTable from "../../../../components/child/DataTable";
import { useDebounce } from "../../../../hooks/useDebounce";
import TaskSummaryCards from "./TaskSummaryCards";
import TaskFilterBar from "./TaskFilterBar";
import { useTaskColumns } from "./useTaskColumn";
import { defaultFilters, type TaskFilters } from "../taskTable.types";

const TaskTable = ({
  onEdit,
  onDelete,
  OnView,
}: {
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  OnView: (task: ITask) => void;
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(defaultFilters); // editing
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters); // querying
  const debouncedSearch = useDebounce(filters.search, 2000);

  const setFilter = <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, val]) => {
      if (key === "searchBy" || key === "dateType" || key === "search")
        return false;
      if (Array.isArray(val)) return val.length > 0;
      return val !== "" && val !== null && val !== undefined;
    }).length;
  }, [filters]);

  const { data, isLoading } = useGetAllTasksQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    assignedBy: appliedFilters.assignedBy,
    assignedTo: appliedFilters.assignedTo,
    status,
    sortBy: sortBy as
      | "createdAt"
      | "status"
      | "title"
      | "updatedAt"
      | "dueStatus"
      | "dueDate",
    sortOrder,
    dateType: appliedFilters.dateType,
    datePreset: appliedFilters.datePreset || undefined,
    startDate: appliedFilters.datePreset
      ? undefined
      : appliedFilters.startDate || undefined,
    endDate: appliedFilters.datePreset
      ? undefined
      : appliedFilters.endDate || undefined,
    dueStatus: appliedFilters.dueStatus || undefined,
    hasDueDate: appliedFilters.hasDueDate || "",
    isCompleted: appliedFilters.isCompleted || "",
  });

  const columns = useTaskColumns({ onEdit, onDelete, onView: OnView });

  if (isLoading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <>
      <TaskSummaryCards
        counts={data?.data?.counts}
        total={data?.data?.total}
        status={status}
        onStatusChange={setStatus}
      />

      <TaskFilterBar
        filters={filters}
        search={debouncedSearch}
        status={status}
        setFilter={setFilter}
        activeFilterCount={activeFilterCount}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      <DataTable
        columns={columns}
        data={data?.data.tasks ?? []}
        total={data?.data.total ?? 0}
        page={page}
        limit={limit}
        sortBy={sortBy}
        order={sortOrder}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onSearchChange={(value) => setFilter("search", value)}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortOrder(direction);
        }}
      />
    </>
  );
};

export default TaskTable;
