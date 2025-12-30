import type {
  IncidentFormSubmissionResponse,
  IncidentReportCredentials,
  IncidentReportQuery,
} from "../interfaces/incidentReport";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface IncidentReport {
  _id: string;
  dateOfIncident: Date | string;
  location: string;
  description: string;
  witnesses: string[];
  actionsTaken?: string;

  submittedBy: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}
interface incidentReportCredentials {
  date: Date;
  location: string;
  description: string;
  witnesses?: string[];
  actionsTaken: string;
}
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
    editIncidentReport: builder.mutation<
      ApiGeneralResponse,
      { id: string; credentials: incidentReportCredentials }
    >({
      query: ({ id, credentials }) => ({
        url: `/incident-reports/edit/${id}`,
        method: "PATCH",
        body: credentials,
      }),
      invalidatesTags: ["IncidentReport"],
    }),
    deleteIncidentReport: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/incident-reports/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IncidentReport"],
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
  useDeleteIncidentReportMutation,
} = IncidentReportApi;
