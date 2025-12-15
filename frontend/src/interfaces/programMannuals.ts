import type { FileType } from "./fileinterface";
import type { ApiResponse } from "./Response";

export interface ProgrammMannualsCredentials {
  title: string;
  description: string;
  tags: string[];
  type: string;
}
export interface ProgramMannualData {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  type: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number; // Cloudinary gives bytes
    fileType: FileType; // null if not a PDF
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammMannualsResponseData {
  manuals: ProgramMannualData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface ProgramManualsQuery {
  page?: number;
  limit?: number;
  search?: string;
  slug?: string;
  type?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export type ProgrammMannualsResponse =
  ApiResponse<ProgrammMannualsResponseData>;
