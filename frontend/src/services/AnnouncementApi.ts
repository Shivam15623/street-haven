import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface AnnouncementData {
  _id: string;
  isActive: boolean;
  title: string;
  message: string;
  attachment?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    size: number;
  };
  createdBy: {
    firstname: string;
    lastname: string;
    _id: string;
  };
  createdAt: Date;
}
export type ViewAnnouncementResponse = ApiResponse<{
  announcements: AnnouncementData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;
export const announcementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    viewAnnouncements: builder.query<
      ViewAnnouncementResponse,
      { id?: string; page?: number; limit?: number; keyword?: string }
    >({
      query: ({ id, page = 1, limit = 10, keyword = "" }) => ({
        url: "/announcement",
        method: "GET",
        params: { id, page, limit, keyword },
      }),
      providesTags: ["Announcement"],
    }),
    createAnnouncement: builder.mutation<ApiGeneralResponse, FormData>({
      query: (formData) => ({
        url: "/announcement/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Announcement"],
    }),
    editAnnouncement: builder.mutation<
      ApiGeneralResponse,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/announcement/edit/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Announcement"],
    }),

    deleteAnnouncement: builder.mutation<ApiGeneralResponse, string>({
      query: (id) => ({
        url: `/announcement/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Announcement"],
    }),
  }),
});

export const {
  useViewAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useEditAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementApi;
