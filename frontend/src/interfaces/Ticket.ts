import type { ApiResponse } from "./Response";

export interface TicketData {
  _id: string; // optional when creating, present when fetched
  req_title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Under Review" | "Completed"; // default: Open
  category: "IT Help Desk" | "Facilities";
  location?: string;
  photo?: TicketPhoto;
  assignedTo?: userPopulatedData; // or a populated User object if you want
  createdBy: userPopulatedData; // required
  createdAt?: Date; // from timestamps
  updatedAt?: Date; // from timestamps
}

interface TicketPhoto {
  fileName: string;
  fileUrl: string;
}
interface userPopulatedData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface TicketFetchQuery {
  page: number;
  limit: number;
  search?: string;
  priority: "Low" | "Medium" | "High" | "All";
  status: "Open" | "In Progress" | "Under Review" | "Completed" | "All";
  order: "asc" | "desc";
}
interface TicketPaggination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}
export type TicketFetchResponseData = ApiResponse<{
  counts: {
    open: number;
    inProgress: number;
    completed: number;
    underReview: number;
    total: number;
  };
  tickets: TicketData[];
  paggination: TicketPaggination;
}>;
