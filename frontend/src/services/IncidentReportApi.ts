import type {
  IncidentFormSubmissionResponse,
  IncidentReportCredentials,
  IncidentReportQuery,
} from "../interfaces/incidentReport";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

const IncidentReportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createIncidentReport: builder.mutation<
      ApiGeneralResponse,
      IncidentReportCredentials
    >({
      query: (credentials) => ({
        url: "/incident-reports/create",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["IncidentReport"],
    }),
    editIncidentReport: builder.mutation({
      query: (credentials) => ({
        url: "/incident-reports/edit",
        method: "PATCH",
        body: credentials,
      }),
    }),
    viewIncidentReport: builder.query<
      IncidentFormSubmissionResponse,
      IncidentReportQuery
    >({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        order = "desc",
      }) => ({
        url: "/incident-reports/view",
        method: "GET",
        params: { page, limit, search, sortBy, order },
      }),
      providesTags: ["IncidentReport"],
    }),
  }),
});

export const {
  useCreateIncidentReportMutation,
  useEditIncidentReportMutation,
  useViewIncidentReportQuery,
} = IncidentReportApi;
