import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface notificationData {
  createdAt: string;
  createdBy: string;
  link: string;
  message: string;
  meta: any;
  title: string;
  type: string;
  updatedAt: string;
  _id: string;
  readAt: string | null;
  isRead: boolean;
  isGlobal: boolean;
  expireAt: string;
}

type NotificationResponse = ApiResponse<{
  notifications: notificationData[];
  paggination: {
    total: number;
    totalPages: number;
    limit: number;
    page: number;
  };
}>;
interface AllNotificationsQuery {
  page?: number;
  limit?: number;
  type: "global" | "personal" | undefined;
  readStatus: "read" | "unread" | "all";
}
const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchNotify: builder.query<NotificationResponse, AllNotificationsQuery>({
      query: ({
        limit = 10,
        page = 1,
        type = undefined,
        readStatus = "all",
      }) => ({
        url: "/notifications/view",
        method: "GET",
        params: { limit, page, readStatus, type },
      }),
      providesTags: ["Notification"],
    }),
    markNotificationsAsRead: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: "/notifications/mark-read",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useFetchNotifyQuery, useMarkNotificationsAsReadMutation } =
  notificationApi;
