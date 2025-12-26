import type {
  MeetingMinuteQuery,
  MeetingMinuteresponse,
} from "../interfaces/meetingMinutes";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";

const meetingMinutesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchMeetingMinutes: builder.query<
      MeetingMinuteresponse,
      MeetingMinuteQuery
    >({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        slug = "",
        sortBy = "createdAt",
        order = "desc",
      }) => ({
        url: "/meeting-minutes/view",
        method: "GET",
        params: { page, limit, search, sortBy, order, slug },
      }),
      providesTags: ["Meetings"],
    }),
    createmeetingMinutes: builder.mutation({
      queryFn: ({ data, onProgress }) =>
        uploadWithProgress(
          "/meeting-minutes/create",
          "POST"
        )({
          data,
          onProgress,
        }),

      invalidatesTags: ["Meetings"],
    }),
    editmeetingMinutes: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: FormData; onProgress?: (p: number) => void }
    >({
      queryFn: ({ id, data, onProgress }) =>
        uploadWithProgress(
          `/meeting-minutes/edit/${id}`,
          "PATCH"
        )({
          data,
          onProgress,
        }),

      invalidatesTags: ["Meetings"],
    }),
    deletemeetingMinutes: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/meeting-minutes/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Meetings"],
    }),
  }),
});

export const {
  useFetchMeetingMinutesQuery,
  useCreatemeetingMinutesMutation,
  useEditmeetingMinutesMutation,
  useDeletemeetingMinutesMutation,
  useLazyFetchMeetingMinutesQuery
} = meetingMinutesApi;
