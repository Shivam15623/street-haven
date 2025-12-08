import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface ClientIncidentCredentials {
  date: Date;
  time: string;
  place: string;
  type: string;
  affectedClient: string;
  staffName: string;
  staffEmail: string;
  witnessName: string;
  otherincidentType?: string;
  description: string;
  action: string;
  debrief: string;
  reportingStaffName: string;
  reportedTo: string;
  reportingDate: Date;
  reportedToDate: Date;
  followUp: string;
}
export interface clientFeedbackCredentials {
  date: Date;
  location: string;
  clientAddress?: string;
  type: string;
  clientEmail?: string;
  clientPhone?: string;
  clientName?: string;
  otherComplaint?: string;
  impact: string;
  outcome: string;
  description: string;
}
export interface EmployeeIncidentCredentials {
  type: string;
  name: string;
  jobTitle: string;
  supervisor: string;
  informedSupervisor: boolean;
  injuryDate: Date;
  injuryTime: string;
  witnessName?: string;
  location: string;
  activityAtTime: string;
  description: string;
  preventionSuggestion: string;
  injuredBodyPartOrRisk: string;
  doctorName?: string;
  sawDoctor: boolean;
  doctorPhone?: string;
  doctorVisitDate?: Date;
  doctorVisitTime?: string;
  previousInjury: boolean;
  previousInjuryDate?: Date;
}
const FormApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createClientincident: builder.mutation<
      ApiGeneralResponse,
      ClientIncidentCredentials
    >({
      query: (credentials) => ({
        url: "/form/clientIncident",
        method: "POST",
        body: credentials,
      }),
    }),
    createClientFeedback: builder.mutation<
      ApiGeneralResponse,
      clientFeedbackCredentials
    >({
      query: (credentials) => ({
        url: "/form/clientFeedback",
        method: "POST",
        body: credentials,
      }),
    }),
    createEmployeeIncident: builder.mutation<
      ApiGeneralResponse,
      EmployeeIncidentCredentials
    >({
      query: (credentials) => ({
        url: "/form/employeeIncident",
        method: "POST",
        body: credentials,
      }),
    }),
    createPaymentRequistion: builder.mutation<ApiGeneralResponse, FormData>({
      query: (FormData) => ({
        url: "/form/paymentRequistion",
        method: "POST",
        body: FormData,
      }),
    }),
    createFAf: builder.mutation({
      query: (credentials) => ({
        url: "/form/functionalAbilties",
        method: "POST",
        body: credentials,
      }),
    }),
    createmediaConsent: builder.mutation({
      query: (credentials) => ({
        url: "/form/mediaConsent",
        method: "POST",
        body: credentials,
      }),
    }),
    
  }),
});

export const {
  useCreateClientFeedbackMutation,
  useCreateClientincidentMutation,
  useCreateEmployeeIncidentMutation,
  useCreatePaymentRequistionMutation,
  useCreateFAfMutation,
  useCreatemediaConsentMutation,
} = FormApi;
