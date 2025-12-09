import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface MediaConsent {
  _id?: string;
  date: Date;
  name: string;
  printedname: string;
  createdAt?: Date;
  updatedAt?: Date;
}
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

export interface ClientFeedbackCredentials {
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
export interface clientFeedbackData {
  _id: string;
  visitDate: Date;
  visitLocation: string;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientAddress: string | null;

  complaintNature: string;
  complaintDescription: string;
  desiredOutcome: string;
  impact: string;

  otherComplaintText?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface clientIncidentReport {
  incidentDate: Date;
  incidentTime: string;
  incidentPlace: string;
  incidentType: string;
  affectedPerson: string;
  staffName: string;
  staffEmail: string;
  witnessName: string;
  otherincidentText: string | undefined;
  incidentDescription: string;
  ActionTaken: string;
  debrief: string;
  reportingStaffName: string;
  reportedTo: string;
  reportingDate: string;
  followup: string;
  reportedToDate: Date;
}
export interface employeeIncidentReport {
  reportType: string;
  name: string;
  jobTitle: string;
  supervisor: string;
  informedSupervisor: boolean;
  injuryDate: Date;
  injuryTime: string;
  location: string;
  activityAtTime: string;
  description: string;
  preventionSuggestion: string;
  injuredBodyPartOrRisk: string;
  sawDoctor: boolean;
  doctorName?: string;
  doctorPhone?: string;
  doctorVisitDate?: Date;
  doctorVisitTime?: string;
  previousInjuryDate?: string;
  previousInjury: boolean;
}
interface PurchaseDetail {
  purchaseDate: Date;
  purchaseNature: string;
  program: string;
  expenseCode: string;
  netAmount: number;
  hst: number;
  totalAmount: number;
}

export interface PaymentRequisition {
  _id?: string;

  paymentDetails: PurchaseDetail[];

  requestedBy: string;
  approvedBy: string;

  requestedDate: Date;
  approvedDate: Date;

  payeeName: string;

  totalAmount: number;

  invoiceAttachment: string;

  createdAt?: Date;
  updatedAt?: Date;
}
export interface Address {
  address: string;
  cityTown: string;
  province: string;
  postalCode: string;
}

export interface HandSide {
  gripping?: boolean;
  pinching?: boolean;
  other?: boolean;
}

export interface FunctionalAbility {
  _id?: string;

  claimNo: string;

  worker: {
    firstName: string;
    lastName: string;
    telephone: string;
  } & Address & {
      dateOfBirth: Date;
    };

  dateOfAccident: Date;
  employerFaxNo: string;

  employer: {
    fullName: string;
    telephone: string;
  } & Address;

  typeOfJobAtAccident: string;
  areasOfInjury: string;

  discussedRTW: boolean;
  nodateOfDiscusswill?: Date;
  employerContactName: string;
  position: string;

  designationOfHealthPro: string;

  iswsibRegistered: boolean;
  wsibId: string;
  invoiceNo: string;
  srvCode: string;

  hstRegNo: string;
  hstSrvcCode: string;
  hstAmount: number;

  healthProfessionalName: string;
  hproAddress: string;
  hprocityTown: string;
  hproProvince: string;
  hproPostalCode: string;
  hproFax: string;

  assesmentDate: Date;

  returnToWorkStatus: "noRestrictions" | "withRestrictions" | "unable";

  abilities?: {
    walking: string;
    standing: string;
    sitting: string;
    liftingFloorToWaist: string;
    liftingWaistToShoulder: string;
    stairClimbing: string;
    ladderClimbing: string;

    travelToWork: {
      publicTransit: "yes" | "no";
      car: "yes" | "no";
    };
  };

  restrictions?: {
    bendingTwisting?: string;
    chemicalExposure?: string;
    environmentalExposure?: string;
    operatingMotorizedEquipment?: string;
    medicationSideEffects?: string;
    workAboveShoulder?: string;

    limitedPushingPulling?: {
      leftArm?: boolean;
      rightArm?: boolean;
      other?: boolean;
    };

    exposureToVibration?: {
      wholeBody?: boolean;
      handArm?: boolean;
    };

    limitedUseOfHands?: {
      left?: HandSide;
      right?: HandSide;
    };
  };

  commentsOnAbilties?: string;

  assessmentDuration?: "1-2 days" | "3-7 days" | "8-14 days" | "14+ days";

  isDiscussRTWtoPatient?: boolean;
  nextAppointmentDate?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------- API -----------------
const FormApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- Mutations (POST) ----------
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
      ClientFeedbackCredentials
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
      query: (formData) => ({
        url: "/form/paymentRequistion",
        method: "POST",
        body: formData,
      }),
    }),
    createFAf: builder.mutation<ApiGeneralResponse, any>({
      query: (credentials) => ({
        url: "/form/functionalAbilties",
        method: "POST",
        body: credentials,
      }),
    }),
    createmediaConsent: builder.mutation<ApiGeneralResponse, any>({
      query: (credentials) => ({
        url: "/form/mediaConsent",
        method: "POST",
        body: credentials,
      }),
    }),

    // ---------- Queries (GET) ----------
    getAllClientFeedback: builder.query<
      ApiResponse<{
        allfeedbackSubmissions: clientFeedbackData[];
        paggination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/form/clientFeedback?page=${page}&limit=${limit}&search=${search}`,
    }),
    getAllClientIncidents: builder.query<
      ApiResponse<{
        data: clientIncidentReport[];
        paggination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/form/clientIncident?page=${page}&limit=${limit}&search=${search}`,
    }),
    getAllEmployeeIncidents: builder.query<
      ApiResponse<{
        data: employeeIncidentReport[];
        paggination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/form/employeeIncident?page=${page}&limit=${limit}&search=${search}`,
    }),
    getAllPaymentRequisitions: builder.query<
      ApiResponse<{
        data: PaymentRequisition[];
        paggination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/form/paymentRequistion?page=${page}&limit=${limit}&search=${search}`,
    }),
    getAllFAF: builder.query<
      ApiResponse<{
        data: FunctionalAbility[];
        paggination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/form/functionalAbilties?page=${page}&limit=${limit}&search=${search}`,
    }),
    getAllMediaConsent: builder.query<
      ApiResponse<{
        data: MediaConsent[];
        paggination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/form/mediaConsent?page=${page}&limit=${limit}&search=${search}`,
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
  useGetAllClientFeedbackQuery,
  useGetAllClientIncidentsQuery,
  useGetAllEmployeeIncidentsQuery,
  useGetAllPaymentRequisitionsQuery,
  useGetAllFAFQuery,
  useGetAllMediaConsentQuery,
} = FormApi;
