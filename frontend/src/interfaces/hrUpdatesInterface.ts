import type { ApiResponse } from "./Response";

export interface hrUpdatesQuery {
  page?: number;
  limit?: number;
  slug?:string;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface hrUpdateData {
  _id: string;
  title: string;
  description: string;
  createdBy: {
    firstname: string;
    lastname: string;
    email: string;
  };
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number; // Cloudinary gives bytes
    totalPages: number; // null if not a PDF
  };
  createdAt: string;
  updatedAt: string;
}

export type hrUpdatesResponse = ApiResponse<{
  hrupdates: hrUpdateData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;
