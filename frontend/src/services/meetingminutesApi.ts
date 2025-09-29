import type {
  MeetingMinuteQuery,
  MeetingMinuteresponse,
} from "../interfaces/meetingMinutes";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

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
    createmeetingMinutes: builder.mutation<ApiGeneralResponse, FormData>({
      query: (credentials) => ({
        url: "/meeting-minutes/create",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Meetings"],
    }),
    editmeetingMinutes: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/meeting-minutes/edit/${id}`,
        method: "PATCH",
        body: data,
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
} = meetingMinutesApi;
