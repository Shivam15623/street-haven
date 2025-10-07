import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface notificationData {
  createdAt: string;
  createdBy: string;
  level: "high" | "low" | "medium";
  link: string;
  message: string;
  meta: any;
  recipients: string[];
  title: string;
  type: string;
  updatedAt: string;
  _id: string;
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
}
const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchNotify: builder.query<NotificationResponse, AllNotificationsQuery>({
      query: ({ limit = 10, page = 1 }) => ({
        url: "/notifications/view",
        method: "GET",
        params: { limit, page },
      }),
    }),
  }),
});

export const { useFetchNotifyQuery } = notificationApi;
