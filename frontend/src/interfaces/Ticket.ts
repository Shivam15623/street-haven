import type { ApiResponse } from "./Response";

export interface TicketData {
  _id: string; // optional when creating, present when fetched
  displayId:string;
  slug:string;
  req_title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status:
    | "Open"
    | "Approved"
    | "Rejected"
    | "In Progress"
    | "Completed"
    | "Closed"; // default: Open
  category:string;
  location?: {
    _id: string;
    name: string;
    managers: string[];
  };
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
  status:
    | "Open"
    | "Approved"
    | "Rejected"
    | "In Progress"
    | "Completed"
    | "Closed"
    | "All";
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
    approved: number;
    completed: number;
    inProgress: number;
    total: number;
  };
  tickets: TicketData[];
  paggination: TicketPaggination;
}>;
