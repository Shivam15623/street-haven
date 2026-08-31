import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

// Common fields present on every notification regardless of source.
interface BaseNotification {
  _id: string;
  source: "system" | "comment";
  title: string | null;
  message: string;
  severity: "info" | "success" | "warning" | "error";
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sortDate: string;
}

// system: generic Notification-backed rows
interface SystemNotification extends BaseNotification {
  source: "system";
}

// comment: UserCommentNotification-backed rows — carry the extra
// entity/grouping fields the generic ones don't have.
interface CommentNotification extends BaseNotification {
  source: "comment";
  entityType: "Ticket" | "Task";
  entityId: string;
  commentId: string | null;
  notifType: "mention" | "reply" | "assignment" | "activity" | "other";
  priority: "high" | "normal" | "low";
  commentCount: number;
}

export type notificationData = SystemNotification | CommentNotification;

export interface ActivityLogData {
  _id: string;
  actionType: string;
  performedBy: {
    id: string | null;
    name: string | null;
    type: "system" | "user";
  };
  message: string;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  __v?: number;
}

interface AllNotificationsQuery {
  page?: number;
  limit?: number;
  type?: "global" | "personal";
  readStatus?: "read" | "unread" | "all";
}

type NotificationResponse = ApiResponse<{
  notifications: notificationData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

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
      query: ({ page = 1, limit = 20, type, readStatus = "all" }) => ({
        url: "/notifications/view",
        method: "GET",
        params: {
          page,
          limit,
          ...(type ? { type } : {}),
          readStatus,
        },
      }),
      providesTags: ["Notification"],
    }),
    fetchUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
    // ids can be mixed system + comment ids in one call — backend splits them
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
  useFetchUnreadCountQuery,
  useMarkNotificationsAsReadMutation,
  useFetchActivityLogsQuery,
} = notificationApi;
