import React, { type FC } from "react";
import { Icon } from "@iconify/react";
import type { ticketsReportFilters } from "./TicketReport";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import { useAllEmployeesQuery } from "../../../../../services/EmployeeApi";
import { useFetchLocationsQuery } from "../../../../../services/locationApi";

interface Props {
  filters: ticketsReportFilters;
  setFilters: React.Dispatch<React.SetStateAction<ticketsReportFilters>>;
}

const TicketFilter: FC<Props> = ({ filters, setFilters }) => {
  const [dateError, setDateError] = React.useState("");
  const { data: employeeData, isLoading: isEmployeeLoading } =
    useAllEmployeesQuery({ forDropdown: true });
  const { data: locationsData, isLoading: locationsLoading } =
    useFetchLocationsQuery({});
  const today = new Date();

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const validateDateFilter = (
    key: "startDate" | "endDate",
    value: string,
    otherValue: string,
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];

    if (key === "startDate") {
      if (value > todayStr) return "Start date cannot be in the future";
      if (otherValue && value > otherValue)
        return "Start date cannot be after end date";
    }

    if (key === "endDate") {
      if (value > todayStr) return "End date cannot be in the future";
      if (otherValue && value < otherValue)
        return "End date cannot be before start date";
    }

    return "";
  };

  const updateFilter = <K extends keyof ticketsReportFilters>(
    key: K,
    value: ticketsReportFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleDateChange = (
    key: "startDate" | "endDate",
    date: Date | null,
  ) => {
    if (!date) {
      setDateError("");
      updateFilter(key, "");
      return;
    }

    const formatted = formatDate(date);
    const otherValue =
      key === "startDate" ? filters.endDate : filters.startDate;
    const error = validateDateFilter(key, formatted, otherValue);

    if (error) {
      setDateError(error);
      return;
    }

    setDateError("");
    updateFilter(key, formatted);
  };

  const clearFilters = () => {
    setDateError("");
    setFilters({
      startDate: "",
      endDate: "",
      location: "",
      status: "All",
      createdBy: "",
      assignedTo: "",
      approvedBy: "",
      page: 1,
      limit: 10,
    });
  };

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.location ||
    filters.status !== "All" ||
    filters.createdBy ||
    filters.assignedTo ||
    filters.approvedBy;

  return (
    <div className="card radius-16 border-0 shadow-4">
      <div className="card-body p-20 d-flex flex-column gap-16">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="text-sm fw-semibold text-neutral-900 mb-0 d-flex align-items-center gap-8">
            <Icon
              icon="mdi:filter-variant"
              width={18}
              className="text-neutral-500"
            />
            Filters
          </h6>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-sm btn-street-neutral radius-8 text-xs fw-medium d-flex align-items-center gap-6"
            >
              <Icon icon="mdi:close" width={14} />
              Clear Filters
            </button>
          )}
        </div>

        <div className="row row-gap-2">
          {/* Start Date */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label text-xs fw-medium text-neutral-700 mb-6">
              Start Date
            </label>
            <CustomDatePicker
              value={filters.startDate ? new Date(filters.startDate) : null}
              maxDate={today}
              onChange={(date) => handleDateChange("startDate", date)}
              placeholder="Select start date"
            />
          </div>

          {/* End Date */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label text-xs fw-medium text-neutral-700 mb-6">
              End Date
            </label>
            <CustomDatePicker
              value={filters.endDate ? new Date(filters.endDate) : null}
              minDate={
                filters.startDate ? new Date(filters.startDate) : undefined
              }
              maxDate={today}
              onChange={(date) => handleDateChange("endDate", date)}
              placeholder="Select end date"
            />
          </div>

          {/* Location */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label text-xs fw-medium text-neutral-700 mb-6">
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Locations</option>
              {locationsLoading ? (
                <option disabled>Loading...</option>
              ) : (
                locationsData?.data.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Status */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label text-xs fw-medium text-neutral-700 mb-6">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                updateFilter(
                  "status",
                  e.target.value as ticketsReportFilters["status"],
                )
              }
              className="form-select text-sm"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Created By */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label text-xs fw-medium text-neutral-700 mb-6">
              Created By
            </label>
            <select
              value={filters.createdBy}
              onChange={(e) => updateFilter("createdBy", e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Creators</option>
              {isEmployeeLoading ? (
                <option disabled>Loading...</option>
              ) : (
                employeeData?.data.employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstname} {emp.lastname}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Assigned To */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label text-xs fw-medium text-neutral-700 mb-6">
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) => updateFilter("assignedTo", e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Assignees</option>
              {isEmployeeLoading ? (
                <option disabled>Loading...</option>
              ) : (
                employeeData?.data.employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstname} {emp.lastname}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Approved By */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label text-xs fw-medium text-neutral-700 mb-6">
              Approved By
            </label>
            <select
              value={filters.approvedBy}
              onChange={(e) => updateFilter("approvedBy", e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Approvers</option>
              {isEmployeeLoading ? (
                <option disabled>Loading...</option>
              ) : (
                employeeData?.data.employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstname} {emp.lastname}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {dateError && (
          <div className="d-flex align-items-center gap-8 bg-danger-focus radius-8 px-12 py-8 w-fit">
            <Icon
              icon="mdi:alert-circle-outline"
              width={14}
              className="text-danger-main"
            />
            <span className="text-xs text-danger-main">{dateError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketFilter;
