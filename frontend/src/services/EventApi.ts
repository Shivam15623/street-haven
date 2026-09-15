import type {
  EventCalendarCredentials,
  EventCredentials,
  EventUpcomingResponse,
} from "../interfaces/EventInterfaces";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

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
    editEvent: builder.mutation({
      query: (credentials) => ({
        url: "/events/edit",
        method: "PATCH",
        body: credentials,
      }),
      invalidatesTags: ["Event"],
    }),
    fetchEventsupcoming: builder.query<EventUpcomingResponse, undefined>({
      query: () => ({
        url: "/events/upcoming",
        method: "GET",
      }),
      providesTags: ["Event"],
    }),
    fetchEventsCalendar: builder.query<
      EventUpcomingResponse,
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
  }),
});

export const {
  useCreateEventMutation,
  useEditEventMutation,
  useFetchEventsupcomingQuery,
  useFetchEventsCalendarQuery,
  useSignUpForEventMutation,
} = EventApi;
