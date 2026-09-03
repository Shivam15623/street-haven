import type { BadgeVariant } from "../../../components/child/Badge";
import type { TaskStatus } from "../../../services/taskApi";


export type DueStatus = "overdue" | "today" | "upcoming" | "noduedate";
export type DatePreset = "" | "today" | "week" | "month" | "year";
export type SearchBy = "both" | "title" | "description";
export type DateType = "created" | "updated" | "due";

export interface TaskFilters {
  search: string;
  searchBy: SearchBy;
  assignedBy: string[];
  assignedTo: string[];
  dateType: DateType;
  datePreset: DatePreset;
  startDate: string;
  endDate: string;
  dueStatus: DueStatus | "";
  hasDueDate: "" | "true" | "false";
  isCompleted: "" | "true" | "false";
}

export const defaultFilters: TaskFilters = {
  search: "",
  searchBy: "both",
  dateType: "created",
  datePreset: "",
  startDate: "",
  endDate: "",
  dueStatus: "",
  hasDueDate: "",
  isCompleted: "",
  assignedBy: [],
  assignedTo: [],
};

export const dueStatusVariant: Record<DueStatus, BadgeVariant> = {
  overdue: "danger-soft",
  today: "warning-soft",
  upcoming: "info-soft",
  noduedate: "secondary-soft",
};

export const dueStatusLabel: Record<DueStatus, string> = {
  overdue: "Overdue",
  today: "Due Today",
  upcoming: "Upcoming",
  noduedate: "No Due Date",
};

export const taskBadgeVariant: Record<TaskStatus, BadgeVariant> = {
  new: "info-soft",
  assigned: "warning-soft",
  under_review: "info-soft",
  completed: "success-soft",
};