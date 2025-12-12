import type { FileItem } from "./fileinterface";
import type { ApiResponse } from "./Response";

export interface EventCredentials {
  title: string;
  description: string;
  locationName: string;
  locationUrl: string;
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
  location: { location_name: string; location_url: string };
  eventDate: string; // ISO date string (e.g. "2025-09-11T00:00:00.000Z")
  startTime: string; // ISO date string with time
  endTime: string; // ISO date string with time
  facilitator: string;
  registeredUsers: string[]; // assuming these are user IDs
  totalRegistered: number;
  capacity: number;
  isRegistered: boolean;
  slug: string;
  status: "upcoming" | "completed" | "cancelled"; // extend as per your app logic
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  documents: FileItem[];
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

export interface EventRegisterationsData {
  _id: string;
  title: string;
  registeredUsers: [
    {
      _id: string;
      firstname: string;
      lastname: string;
      email: string;
      slug: string;
      phoneNo: string;
    }
  ];
  totalRegistered: number;
  capacity: number;
}
export type EventRegisterations = ApiResponse<EventRegisterationsData>;
export type EventCalendarResponse = ApiResponse<EventUpcomingData[]>;
export type EventUpcomingResponse = ApiResponse<{
  events: EventUpcomingData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;
