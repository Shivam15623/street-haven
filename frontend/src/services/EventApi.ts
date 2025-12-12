import type {
  EventCalendarCredentials,
  EventCalendarResponse,
  EventCredentials,
  EventRegisterations,
  EventUpcomingQuery,
  EventUpcomingResponse,
} from "../interfaces/EventInterfaces";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";

export const EventApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation<ApiGeneralResponse, EventCredentials>({
      query: (credentials) => ({
        url: "/events/create",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Event"],
    }),
    editEvent: builder.mutation<
      ApiGeneralResponse,
      { cred: EventCredentials; id: string }
    >({
      query: ({ cred, id }) => ({
        url: `/events/edit/${id}`,
        method: "PATCH",
        body: cred,
      }),
      invalidatesTags: ["Event"],
    }),
    fetchEventsupcoming: builder.query<
      EventUpcomingResponse,
      EventUpcomingQuery
    >({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        slug = "",
        sortBy = "eventDate",
        order = "asc",
      }) => ({
        url: "/events/upcoming",
        method: "GET",
        params: { page, limit, search, slug, sortBy, order },
      }),
      providesTags: ["Event"],
    }),
    fetchEventsPast: builder.query<EventUpcomingResponse, EventUpcomingQuery>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        slug = "",
        sortBy = "eventDate",
        order = "asc",
      }) => ({
        url: "/events/past",
        method: "GET",
        params: { page, limit, search, slug, sortBy, order },
      }),
      providesTags: ["Event"],
    }),
    fetchEventsCalendar: builder.query<
      EventCalendarResponse,
      EventCalendarCredentials
    >({
      query: (credentials) => ({
        url: "/events/calendar",
        method: "POST",
        body: credentials,
      }),
      providesTags: ["Event"],
    }),
    signUpForEvent: builder.mutation<ApiGeneralResponse, string>({
      // string is the event ID
      query: (eventId) => ({
        url: `/events/signup/${eventId}`,
        method: "POST",
      }),
      invalidatesTags: ["Event"],
    }),
    signOutFromEvent: builder.mutation<ApiGeneralResponse, string>({
      query: (eventId) => ({
        url: `/events/signout/${eventId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Event"],
    }),
    getEventRegistrations: builder.query<EventRegisterations, string>({
      query: (id) => ({
        url: `/events/registrations/${id}`,
        method: "GET",
      }),
    }),
    getEventDetail: builder.query({
      query: (slug) => ({
        url: `/events/details/${slug}`,
        method: "GET",
      }),
    }),
    eventuploadDocument: builder.mutation<
      ApiGeneralResponse,
      { eventId: string; formData: FormData; onProgress?: (p: number) => void }
    >({
      queryFn: ({ eventId, formData, onProgress }) =>
        uploadWithProgress(
          `/events/${eventId}/documents`,
          "POST"
        )({
          data: formData,
          onProgress,
        }),

      invalidatesTags: ["Event"],
    }),
    eventdeleteDocument: builder.mutation<
      ApiGeneralResponse,
      { eventId: string; documentId: string }
    >({
      query: ({ eventId, documentId }) => ({
        url: `/events/${eventId}/delete/document/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useEditEventMutation,
  useFetchEventsupcomingQuery,
  useFetchEventsCalendarQuery,
  useSignUpForEventMutation,
  useSignOutFromEventMutation,
  useFetchEventsPastQuery,
  useGetEventRegistrationsQuery,
  useGetEventDetailQuery,
  useEventuploadDocumentMutation,
  useEventdeleteDocumentMutation,
} = EventApi;
