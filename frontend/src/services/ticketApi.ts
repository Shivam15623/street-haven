import type { FileType } from "../interfaces/fileinterface";
import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import type {
  TicketFetchQuery,
  TicketFetchResponseData,
} from "../interfaces/Ticket";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";

export interface commentData {
  _id: string;
  attachments?: {
    _id: string;
    size: number;
    fileName: string;
    fileUrl: string;
    type: FileType;
  }[];
  message: string;
  userId: {
    firstname: string;
    lastname: string;
    _id: string;
    email: string;
  };
  createdAt: string;
}
export type commentResponse = ApiResponse<{
  comments: commentData[];
  paggination: {
    total: number;
    totalPages: number;
    limit: number;
    page: number;
  };
}>;
export interface TicketDetail {
  ticketId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  priorityLocked: boolean;
  category: string;
  location: string;
  photo: { fileName: string; fileUrl: string; _id: string } | null;

  submittedBy: UserInfo | null;
  assignedTo: UserInfo | null;
  approvedBy: UserInfo | null;
  rejectedBy: UserInfo | null;

  rejectionReason: string | null;

  createdAt: string;
  resolvedAt: string | null;
  turnaround: string | null;

  latestComment: LatestComment | null;

  timeline: TimelineItem[];
}

export interface UserInfo {
  name: string;
  email: string;
}

export interface LatestComment {
  text: string;
  author: string;
  createdAt: string;
}

export interface TimelineItem {
  type: "status" | "assignment";

  // Status history
  status?: string;

  // Assignment history
  assignedTo?: string;

  // Common fields
  by: string;
  at: string;
}
const ticketApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchTickets: builder.query<TicketFetchResponseData, TicketFetchQuery>({
      query: (filter) => ({
        url: "/ticket/view",
        method: "GET",
        params: filter,
      }),
      keepUnusedDataFor: 300,
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
    approveTicket: builder.mutation<
      ApiGeneralResponse,
      { ticketId: string; priority: string }
    >({
      query: ({ ticketId, priority }) => ({
        url: `/ticket/${ticketId}/approve`,
        method: "PATCH",
        body: { priority },
      }),
      invalidatesTags: ["Ticket"],
    }),

    rejectTicket: builder.mutation<
      ApiGeneralResponse,
      { ticketId: string; rejectionReason: string }
    >({
      query: ({ ticketId, rejectionReason }) => ({
        url: `/ticket/${ticketId}/reject`,
        method: "PATCH",
        body: { rejectionReason },
      }),
      invalidatesTags: ["Ticket"],
    }),

    startTicket: builder.mutation<ApiGeneralResponse, string>({
      query: (ticketId) => ({
        url: `/ticket/${ticketId}/start`,
        method: "PATCH",
      }),
      invalidatesTags: ["Ticket"],
    }),

    completeTicket: builder.mutation<ApiGeneralResponse, string>({
      query: (ticketId) => ({
        url: `/ticket/${ticketId}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Ticket"],
    }),
    reopenTicket: builder.mutation<ApiGeneralResponse, string>({
      query: ( ticketId ) => ({
        url: `/ticket/${ticketId}/reopen`,
        method: "PATCH",
      }),
      invalidatesTags: ["Ticket"],
    }),

    cancelTicket: builder.mutation<ApiGeneralResponse, string>({
      query: (ticketId) => ({
        url: `/ticket/${ticketId}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Ticket"],
    }),
    addTicketComment: builder.mutation<
      ApiGeneralResponse,
      { ticketId: string; formdata: FormData; onProgress?: (p: number) => void }
    >({
      queryFn: ({ ticketId, formdata, onProgress }) =>
        uploadWithProgress(
          `/ticket/${ticketId}/comments`,
          "POST",
        )({
          data: formdata,
          onProgress,
        }),
    }),
    viewTicketComments: builder.query<
      commentResponse,
      { page: number; limit: number; ticketId: string }
    >({
      query: ({ ticketId, page, limit }) => ({
        url: `/ticket/${ticketId}/comments`,
        method: "GET",
        params: { page, limit },
      }),
      keepUnusedDataFor: 300,
    }),
    fetchTicketReports: builder.query({
      query: ({
        startDate,
        endDate,
        location,
        status,
        page = 1,
        limit = 10,
        createdBy,
        assignedTo,
        approvedBy,
      }) => ({
        url: `/ticket/report`,
        method: "GET",
        params: {
          startDate,
          endDate,
          location,
          status,
          page,
          limit,
          createdBy,
          assignedTo,
          approvedBy,
        },
      }),
      providesTags:["Ticket"]
    }),
    exportTicketReport: builder.mutation<
      Blob,
      {
        startDate: string;
        endDate: string;
        location: string;
        status: string;
        createdBy: string;
        assignedTo: string;
        approvedBy: string;
      }
    >({
      query: ({
        startDate,
        endDate,
        location,
        status,
        createdBy,
        assignedTo,
        approvedBy,
      }) => ({
        url: `/ticket/report/export`,
        method: "GET",
        params: {
          startDate,
          endDate,
          location,
          status,
          createdBy,
          assignedTo,
          approvedBy,
        },
        responseHandler: (response: Response) => response.blob(),
      }),

    }),
    getTicketDetail: builder.query<ApiResponse<TicketDetail>, { id: string }>({
      query: ({ id }) => ({
        url: `/ticket/report/${id}`,
        method: "GET",
      }),
    }),
  }),
});
export const {
  useFetchTicketsQuery,
  useFetchTicketReportsQuery,
  useCreateTicketMutation,
  useEditTicketMutation,
  useAddTicketCommentMutation,
  useViewTicketCommentsQuery,
  useLazyViewTicketCommentsQuery,
  useLazyFetchTicketsQuery,
  useApproveTicketMutation,
  useRejectTicketMutation,
  useStartTicketMutation,
  useCompleteTicketMutation,
  useCancelTicketMutation,
  useGetTicketDetailQuery,
  useLazyGetTicketDetailQuery,
  useExportTicketReportMutation,
  useReopenTicketMutation
} = ticketApi;
