import type { ApiResponse } from "./Response";

export interface MeetingMinutesResponseData {
  meetingMinutes: MeetingMinutesData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MeetingMinutesData {
  _id: string;
  title: string;
  attendees: number;
  meetingDate: string;
  keyTopicsDiscussed: string[];
  keyHighlights: string[];
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number; // Cloudinary gives bytes
    totalPages: number; // null if not a PDF
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface MeetingMinuteQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
export type MeetingMinuteresponse = ApiResponse<MeetingMinutesResponseData>;
