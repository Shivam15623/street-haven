import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import type {
  TicketFetchQuery,
  TicketFetchResponseData,
} from "../interfaces/Ticket";
import { api } from "../redux/ApiSlice";

export interface commentData {
  _id: string;
  attachments?: string[];
  message: string;
  userId: {
    firstname: string;
    lastname: string;
    _id: string;
    email: string;
  };
  createdAt: string;
}
type commentResponse = ApiResponse<{
  comments: commentData[];
  paggination: {
    total: number;
    totalPages: number;
    limit: number;
    page: number;
  };
}>;

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
    editTicket: builder.mutation<
      ApiGeneralResponse,
      { ticketId: string; formData: FormData }
    >({
      query: ({ ticketId, formData }) => ({
        url: `/ticket/edit/${ticketId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Ticket"],
    }),
    addComment: builder.mutation<
      ApiGeneralResponse,
      { ticketId: string; formdata: FormData }
    >({
      query: ({ ticketId, formdata }) => ({
        url: `/ticket/${ticketId}/comments`,
        method: "POST",
        body: formdata,
      }),
    }),
    viewComments: builder.query<
      commentResponse,
      { page: number; limit: number; ticketId: string }
    >({
      query: ({ ticketId, page, limit }) => ({
        url: `/ticket/${ticketId}/comments`,
        method: "GET",
        params: { page, limit },
      }),
    }),
  }),
});
export const {
  useFetchTicketsQuery,
  useCreateTicketMutation,
  useEditTicketMutation,
  useAddCommentMutation,
  useViewCommentsQuery,
} = ticketApi;
