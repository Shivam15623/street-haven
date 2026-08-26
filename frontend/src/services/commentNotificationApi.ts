import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

export interface CommentActor {
  _id: string;
  firstname: string;
  lastname: string;
}

export interface CommentActivityData {
  _id: string;

  entityType: string;
  entityId: string;

  lastActorId: CommentActor | null;

  actorIds: CommentActor[];

  commentCount: number;

  lastCommentAt: string;
}

export interface CommentNotificationData {
  _id: string;

  userId: string;

  activityId: CommentActivityData;

  readAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CommentNotificationQuery {
  page?: number;
  limit?: number;
  readStatus?: "read" | "unread" | "all";
  since?: string;
}

type CommentNotificationResponse = ApiResponse<{
  notifications: CommentNotificationData[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}>;

const commentnotificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchCommentsNotify: builder.query<
      CommentNotificationResponse,
      CommentNotificationQuery
    >({
      query: ({ page = 1, limit = 20, readStatus = "all", since } = {}) => ({
        url: "/notifications/comment-notifications",
        method: "GET",
        params: {
          page,
          limit,
          readStatus,
          ...(since && { since }),
        },
      }),

      providesTags: ["CommentNotification"],
    }),

    markCommentNotificationsAsRead: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: "/notifications/comment-notifications/mark-read",
        method: "POST",
        body: { ids },
      }),

      invalidatesTags: ["CommentNotification"],
    }),
  }),
});

export const {
  useFetchCommentsNotifyQuery,
  useMarkCommentNotificationsAsReadMutation,
} = commentnotificationApi;
