import { Icon } from "@iconify/react";
import TaskActiveFilterChips from "./taskActiveFilterChip";
import TaskFilterControls from "./TaskFilterControlles";
import type { TaskFilters } from "../taskTable.types";
import {
  useExportTaskReportMutation,
  type TaskStatus,
} from "../../../../services/taskApi";

interface Props {
  filters: TaskFilters;
  search: string;
  status: TaskStatus | undefined;
  setFilter: <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K],
  ) => void;
  activeFilterCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onApply: () => void;
  onClear: () => void;
}

const TaskFilterBar = ({
  filters,
  setFilter,
  activeFilterCount,
  showFilters,
  onToggleFilters,
  onApply,
  onClear,
  status,
  search,
}: Props) => {
  const [exportTaskReport, { isLoading: isExporting }] =
    useExportTaskReportMutation();
  const handleExport = async () => {
    try {
      const blob = await exportTaskReport({
        search: search || undefined,
        assignedBy: filters.assignedBy,
        assignedTo: filters.assignedTo,
        status,
        dateType: filters.dateType,
        datePreset: filters.datePreset || undefined,
        startDate: filters.datePreset
          ? undefined
          : filters.startDate || undefined,
        endDate: filters.datePreset ? undefined : filters.endDate || undefined,
        dueStatus: filters.dueStatus || undefined,
        hasDueDate: filters.hasDueDate || undefined,
        isCompleted: filters.isCompleted || undefined,
      }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `task-report-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  return (
    <div
      className="border border-neutral-200 radius-12 p-16 mt-16 mb-16"
      style={{ background: "var(--street-card)" }}
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-8">
        <div className="d-flex align-items-center gap-8 flex-wrap">
          <button
            type="button"
            className={`btn btn-sm d-flex align-items-center gap-2 fw-medium ${
              showFilters || activeFilterCount > 0
                ? "btn-street-primary"
                : "btn-street-outline-primary"
            }`}
            onClick={onToggleFilters}
          >
            <Icon icon="mdi:filter-variant" width={16} />
            <span>Filters</span>
            <Icon
              icon={showFilters ? "mdi:chevron-up" : "mdi:chevron-down"}
              width={16}
            />
          </button>

          {activeFilterCount > 0 && (
            <span className="text-xs text-neutral-500 fw-medium">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
              applied
            </span>
          )}
        </div>
        <button
          className="btn btn-street-edit d-flex text-sm flex-row align-items-center p-8 px-sm-24 px-md-32  justify-content-center radius-12"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? "Exporting..." : "Export Excel"}
        </button>
      </div>

      {activeFilterCount > 0 && (
        <TaskActiveFilterChips filters={filters} setFilter={setFilter} />
      )}

      {showFilters && (
        <>
          <TaskFilterControls filters={filters} setFilter={setFilter} />
          <div className="d-flex justify-content-end gap-2 mt-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="btn btn-street-outline-secondary"
                onClick={onClear}
              >
                Reset
              </button>
            )}
            <button
              type="button"
              className="btn btn-street-primary d-flex align-items-center gap-2"
              onClick={onApply}
              disabled={activeFilterCount === 0}
            >
              <Icon icon="mdi:filter-check-outline" width={18} />
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskFilterBar;
