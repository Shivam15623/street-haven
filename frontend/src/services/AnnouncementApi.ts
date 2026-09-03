import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";
export interface AnnouncementData {
  _id: string;
  isActive: boolean;
  title: string;
  slug:string;
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
      keepUnusedDataFor: 300,
      providesTags: ["Announcement"],
    }),
    createAnnouncement: builder.mutation({
      queryFn: ({ data, onProgress }) =>
        uploadWithProgress(
          "/announcement/create",
          "POST"
        )({
          data,
          onProgress,
        }),

      invalidatesTags: ["Announcement"],
    }),
    editAnnouncement: builder.mutation<
      ApiGeneralResponse,
      { id: string; formData: FormData; onProgress?: (p: number) => void }
    >({
      queryFn: ({ id, formData, onProgress }) =>
        uploadWithProgress(
          `/announcement/edit/${id}`,
          "PATCH"
        )({
          data: formData,
          onProgress,
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
    recentAnnouncementcount: builder.query<ApiResponse<number>, void>({
      query: () => ({
        url: `/announcement/recent-count`,
        method: "GET",
      }),
      providesTags: ["Announcement"],
    }),
  }),
});

export const {
  useViewAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useEditAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useLazyViewAnnouncementsQuery,
  useRecentAnnouncementcountQuery,
} = announcementApi;
