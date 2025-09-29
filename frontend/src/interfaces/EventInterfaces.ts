import type { ApiResponse } from "./Response";

export interface EventCredentials {
  title: string;
  description: string;
  location: string;
  facilitator: string;
  capacity: number;
  eventDate: Date;
  startTime: Date;
  endTime: Date;
}
export interface EventUpcomingData {
  _id: string;
  title: string;
  description: string;
  createdBy: { _id: string; firstname: string; lastname: string };
  location: string;
  eventDate: string; // ISO date string (e.g. "2025-09-11T00:00:00.000Z")
  startTime: string; // ISO date string with time
  endTime: string; // ISO date string with time
  facilitator: string;
  registeredUsers: string[]; // assuming these are user IDs
  totalRegistered: number;
  capacity: number;
  isRegistered: boolean;
  status: "upcoming" | "completed" | "cancelled"; // extend as per your app logic
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
export interface EventCalendarCredentials {
  startDate: string;
  endDate: string;
}
export interface EventUpcomingQuery {
  page?: number;
  limit?: number;
  slug?: string;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
export type EventUpcomingResponse = ApiResponse<{
  events: EventUpcomingData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;
