import type {
  IncidentReportQuery,
  StaffFeedbackSubmissionResponse,
} from "../interfaces/incidentReport";
import { api } from "../redux/ApiSlice";

const StaffFeedbackApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createStaffFeedback: builder.mutation({
      query: (credentials) => ({
        url: "/staff-feedback/create",
        body: credentials,
        method: "POST",
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
export const { useCreateStaffFeedbackMutation, useViewStaffFeedBackQuery } =
  StaffFeedbackApi;
