import type {
  IncidentReportQuery,
  StaffFeedbackSubmissionResponse,
} from "../interfaces/incidentReport";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
interface StaffFeedBackCredentials {
  date: Date;
  category: string;
  location: string;
  description: string;
  witnesses?: string[];
  actionsTaken: string;
}

const StaffFeedbackApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createStaffFeedback: builder.mutation<
      ApiGeneralResponse,
      StaffFeedBackCredentials
    >({
      query: (credentials) => ({
        url: "/staff-feedback/create",
        body: credentials,
        method: "POST",
      }),
      invalidatesTags: ["StaffFeedBack"],
    }),
    editStaffReport: builder.mutation<
      ApiGeneralResponse,
      { id: string; credentials: StaffFeedBackCredentials }
    >({
      query: ({ id, credentials }) => ({
        url: `/staff-feedback/edit/${id}`,
        method: "PATCH",
        body: credentials,
      }),
      invalidatesTags: ["StaffFeedBack"],
    }),
    deleteStaffReport: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/staff-feedback/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StaffFeedBack"],
    }),
    viewStaffFeedBack: builder.query<
      StaffFeedbackSubmissionResponse,
      IncidentReportQuery
    >({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        order = "desc",
      }) => ({
        url: "/staff-feedback/view",
        method: "GET",
        params: { page, limit, search, sortBy, order },
      }),
      providesTags: ["StaffFeedBack"],
    }),
  }),
});
export const {
  useCreateStaffFeedbackMutation,
  useViewStaffFeedBackQuery,
  useDeleteStaffReportMutation,
  useEditStaffReportMutation,
} = StaffFeedbackApi;
