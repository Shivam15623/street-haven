import UserMultiSelect from "../../../../components/UserMultiSelect";
import CustomDatePicker from "../../../../components/child/DatePicker";
import useHasPermission from "../../../../hooks/Auth";
import type { DateType, DatePreset, DueStatus, TaskFilters } from "../taskTable.types";

interface Props {
  filters: TaskFilters;
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void;
}

const TaskFilterControls = ({ filters, setFilter }: Props) => {
  const { hasRole } = useHasPermission();

  return (
    <div className="pt-16 border-top border-neutral-200 mt-12">
      <div className="row g-3">
        {/* SECTION 1: Task Attributes */}
        <div className="col-12">
          <span className="text-xs fw-semibold text-neutral-600 text-uppercase tracking-wider">
            Task Properties
          </span>
        </div>

        <div className="col-lg-3 col-md-4 col-sm-6">
          <label className="text-xs text-neutral-500 mb-1 d-block">Due Status</label>
          <select
            className="form-select form-select-sm"
            value={filters.dueStatus}
            onChange={(e) => setFilter("dueStatus", e.target.value as DueStatus | "")}
          >
            <option value="">All</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="noduedate">No Due Date</option>
          </select>
        </div>

        <div className="col-lg-3 col-md-4 col-sm-6">
          <label className="text-xs text-neutral-500 mb-1 d-block">Has Due Date</label>
          <select
            className="form-select form-select-sm"
            value={filters.hasDueDate}
            onChange={(e) => setFilter("hasDueDate", e.target.value as "" | "true" | "false")}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="col-lg-3 col-md-4 col-sm-6">
          <label className="text-xs text-neutral-500 mb-1 d-block">Completed</label>
          <select
            className="form-select form-select-sm"
            value={filters.isCompleted}
            onChange={(e) => setFilter("isCompleted", e.target.value as "" | "true" | "false")}
          >
            <option value={""}>Any</option>
            <option value="true">Completed</option>
            <option value="false">Not completed</option>
          </select>
        </div>

        {/* SECTION 2: Date Filters */}
        <div className="col-12 mt-3">
          <span className="text-xs fw-semibold text-neutral-600 text-uppercase tracking-wider">
            Date Filtering
          </span>
        </div>

        <div className="col-lg-3 col-md-4 col-sm-6">
          <label className="text-xs text-neutral-500 mb-1 d-block">Date Field</label>
          <select
            className="form-select form-select-sm"
            value={filters.dateType}
            onChange={(e) => setFilter("dateType", e.target.value as DateType)}
          >
            <option value="created">Created Date</option>
            <option value="updated">Updated Date</option>
            <option value="due">Due Date</option>
          </select>
        </div>

        <div className="col-lg-3 col-md-4 col-sm-6">
          <label className="text-xs text-neutral-500 mb-1 d-block">Quick Range</label>
          <select
            className="form-select form-select-sm"
            value={filters.datePreset}
            onChange={(e) => setFilter("datePreset", e.target.value as DatePreset)}
          >
            <option value="">Custom Range</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {!filters.datePreset && (
          <>
            <div className="col-lg-3 col-md-4 col-sm-6">
              <label className="text-xs text-neutral-500 mb-1 d-block">Start Date</label>
              <CustomDatePicker
                value={filters.startDate ? new Date(filters.startDate) : null}
                onChange={(date) =>
                  setFilter("startDate", date ? date.toISOString().split("T")[0] : "")
                }
                placeholder="Select start date"
                maxDate={filters.endDate ? new Date(filters.endDate) : undefined}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6">
              <label className="text-xs text-neutral-500 mb-1 d-block">End Date</label>
              <CustomDatePicker
                value={filters.endDate ? new Date(filters.endDate) : null}
                onChange={(date) =>
                  setFilter("endDate", date ? date.toISOString().split("T")[0] : "")
                }
                placeholder="Select end date"
                minDate={filters.startDate ? new Date(filters.startDate) : undefined}
              />
            </div>
          </>
        )}

        {/* SECTION 3: Assignments */}
        <div className="col-12 mt-3">
          <span className="text-xs fw-semibold text-neutral-600 text-uppercase tracking-wider">
            People
          </span>
        </div>

        <div className="col-lg-6 col-md-6 col-12">
          <UserMultiSelect
            label="Assigned By"
            value={filters.assignedBy}
            role={["volunteer_admin", "super_admin"]}
            onChange={(value) => setFilter("assignedBy", value)}
          />
        </div>

        {hasRole(["volunteer_admin", "super_admin"]) && (
          <div className="col-lg-6 col-md-6 col-12">
            <UserMultiSelect
              label="Assigned To"
              value={filters.assignedTo}
              role={["volunteer"]}
              onChange={(value) => setFilter("assignedTo", value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFilterControls;