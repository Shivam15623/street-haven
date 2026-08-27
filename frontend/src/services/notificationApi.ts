import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface notificationData {
  createdAt: string;
  createdBy: string;
  link: string;
  message: string;
  meta: any;
  title: string;
  category:
    | "ticket"
    | "event"
    | "announcement"
    | "event_minute"
    | "training_material"
    | "additional_documents"
    | "hr_updates"
    | "system";

  action:
    | "created"
    | "updated"
    | "commented"
    | "assigned"
    | "status_changed"
    | "deleted"
    | "registered"
    | "unregistered";

  severity: "info" | "success" | "warning" | "error";

  updatedAt: string;
  _id: string;
  readAt: string | null;
  isRead: boolean;
  isGlobal: boolean;
  expireAt: string;
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
