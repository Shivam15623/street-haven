import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

interface UpdateReadCursorCredentials {
  entityType: "ticket" | "task";
  entityId: string;
  lastSeenCommentId: string;
}

interface UpdateReadCursorResponse {
  advanced: boolean;
}

type ReadCursorResponse = ApiResponse<UpdateReadCursorResponse>;

const ReadCursorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateReadCursor: builder.mutation<
      ReadCursorResponse,
      UpdateReadCursorCredentials
    >({
      query: ({ entityType, entityId, lastSeenCommentId }) => ({
        url: `/${entityType}/${entityId}/read-cursor`,
        method: "PATCH",
        body: {
          lastSeenCommentId,
        },
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useUpdateReadCursorMutation } = ReadCursorApi;
