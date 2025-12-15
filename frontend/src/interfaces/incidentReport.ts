import type { ApiResponse } from "./Response";

export interface IncidentReportCredentials {
  date: string; // yyyy-mm-dd
  location?: string;
  description: string;
  witnesses?: string[];
  actionsTaken?: string;
  reporterName?: string;
}
export interface IncidentReportQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface IncidentReportData {
  _id: string;
  dateOfIncident: string;
  location: string;
  description: string;
  witnesses: string[];
  actionsTaken: string;
  reporterName: string;
  submittedBy: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}
export interface StaffFeedBackCredentials {
  date: string; // yyyy-mm-dd
  location?: string;
  category: "Other" | "Safety" | "Behavior" | "Equipment";
  description: string;
  witnesses?: string[];
  actionsTaken?: string;
  reporterName?: string;
}
export interface StaffFeedbackData {
  date: string;
  location: string;
  description: string;
  category: "Other" | "Safety" | "Behavior" | "Equipment";
  witnesses: string[];
  actionsTaken: string;
  reporterName: string;
  submittedBy: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}
export type StaffFeedbackSubmissionResponse = ApiResponse<{
  allfeedbackSubmissions: StaffFeedbackData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;
export type IncidentFormSubmissionResponse = ApiResponse<{
  allIncidentSubmissions: IncidentReportData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;
