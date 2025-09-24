import type { ApiGeneralResponse } from "../interfaces/Response";
import type {
  TicketFetchQuery,
  TicketFetchResponseData,
} from "../interfaces/Ticket";
import { api } from "../redux/ApiSlice";

const ticketApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchTickets: builder.query<TicketFetchResponseData, TicketFetchQuery>({
      query: (filter) => ({
        url: "/ticket/view",
        method: "GET",
        params: filter,
      }),
      providesTags: ["Ticket"],
    }),
    createTicket: builder.mutation<ApiGeneralResponse, FormData>({
      query: (cradentials) => ({
        url: "/ticket/create",
        method: "POST",
        body: cradentials,
      }),
      invalidatesTags: ["Ticket"],
    }),
    editTicket: builder.mutation({
      query: () => ({
        url: "/ticket/edit",
        method: "PATCH",
      }),
      invalidatesTags: ["Ticket"],
    }),
  }),
});
export const {
  useFetchTicketsQuery,
  useCreateTicketMutation,
  useEditTicketMutation,
} = ticketApi;
