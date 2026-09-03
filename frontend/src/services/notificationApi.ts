import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

export interface notificationData {
  _id: string;
  source: "system" | "comment";
  title: string | null;
  message: string;
  severity: "info" | "warning";
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sortDate: string;

  // comment-only fields
  entityType?: "Ticket" | "Task";
  entityId?: string;
  entity?: {
    type: "Ticket" | "Task";
    id: string;
    displayId: string;
    slug: string;
    title: string;
  } | null;
  commentId?: string | null;
  notifType?: "mention" | "reply" | "assignment" | "activity" | "other";
  priority?: "high" | "normal" | "low";
  commentCount?: number;
}
export interface ActivityLogData {
  _id: string;
  actionType: string;

  performedBy: {
    id: string | null;
    name: string | null;
    type: "system" | "user";
  };

  message: string;

  meta: Record<string, any>; // 👈 dynamic metadata (ANY object)

  createdAt: string;
  updatedAt: string;
  expiresAt?: string;

  __v?: number;
}

type NotificationResponse = ApiResponse<{
  notifications: notificationData[];
  pagination: {
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
interface ActivityLogQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  type?: "system" | "user" | "all";
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
    getUnreadNotificationCount: builder.query<
      ApiResponse<{ count: number }>,
      void
    >({
      query: () => ({
        url: "/notifications/unified/unread-count",
        method: "GET",
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
    fetchActivityLogs: builder.query<
      ApiResponse<{
        paggination: {
          total: number;
          totalPages: number;
          limit: number;
          page: number;
        };
        logs: ActivityLogData[];
      }>,
      ActivityLogQuery
    >({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sort = "createdAt",
        order = "desc",
        type = "all",
      }) => ({
        url: "/activity-logs",
        method: "GET",
        params: { limit, page, type, sort, order, search },
      }),
    }),
  }),
});

export const {
  useFetchNotifyQuery,
  useMarkNotificationsAsReadMutation,
  useFetchActivityLogsQuery,
} = notificationApi;
