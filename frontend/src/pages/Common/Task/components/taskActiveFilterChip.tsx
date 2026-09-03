import { Icon } from "@iconify/react";
import Badge from "../../../../components/child/Badge";
import type { TaskFilters } from "../taskTable.types";

interface Props {
  filters: TaskFilters;
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void;
}

const closeIcon = (onClick: () => void) => (
  <Icon
    icon="mdi:close"
    width={14}
    className="cursor-pointer hover-text-danger"
    onClick={onClick}
  />
);

const TaskActiveFilterChips = ({ filters, setFilter }: Props) => {
  return (
    <div className="d-flex align-items-center flex-wrap gap-2 mt-12 pt-12 border-top border-neutral-100">
      <span className="text-xs text-neutral-400 me-4">Active:</span>

      {filters.dueStatus && (
        <Badge
          variant="secondary-soft"
          shape="badge"
          className="cursor-default"
          rightIcon={closeIcon(() => setFilter("dueStatus", ""))}
        >
          Due: <strong className="text-capitalize">{filters.dueStatus}</strong>
        </Badge>
      )}

      {filters.hasDueDate && (
        <Badge
          variant="secondary-soft"
          rightIcon={closeIcon(() => setFilter("hasDueDate", ""))}
        >
          Has Due Date: <strong>{filters.hasDueDate === "true" ? "Yes" : "No"}</strong>
        </Badge>
      )}

      {filters.isCompleted && (
        <Badge
          variant="secondary-soft"
          rightIcon={closeIcon(() => setFilter("isCompleted", ""))}
        >
          Status:{" "}
          <strong>{filters.isCompleted === "true" ? "Completed" : "Incomplete"}</strong>
        </Badge>
      )}

      {filters.datePreset && (
        <Badge
          variant="secondary-soft"
          rightIcon={closeIcon(() => setFilter("datePreset", ""))}
        >
          Range: <strong className="text-capitalize">{filters.datePreset}</strong>
        </Badge>
      )}

      {filters.startDate && (
        <Badge
          variant="secondary-soft"
          rightIcon={closeIcon(() => setFilter("startDate", ""))}
        >
          From: <strong>{filters.startDate}</strong>
        </Badge>
      )}

      {filters.endDate && (
        <Badge
          variant="secondary-soft"
          rightIcon={closeIcon(() => setFilter("endDate", ""))}
        >
          To: <strong>{filters.endDate}</strong>
        </Badge>
      )}

      {filters.assignedBy.length > 0 && (
        <Badge
          variant="secondary-soft"
          rightIcon={closeIcon(() => setFilter("assignedBy", []))}
        >
          Assigned By: <strong>{filters.assignedBy.length} selected</strong>
        </Badge>
      )}

      {filters.assignedTo.length > 0 && (
        <Badge
          variant="secondary-soft"
          rightIcon={closeIcon(() => setFilter("assignedTo", []))}
        >
          Assigned To: <strong>{filters.assignedTo.length} selected</strong>
        </Badge>
      )}
    </div>
  );
};

export default TaskActiveFilterChips;