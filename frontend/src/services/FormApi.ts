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
  preferredContactMethod: ("Phone" | "Email")[];
}
export const CANADA_PROVINCES = [
  { label: "Alberta", value: "AB" },
  { label: "British Columbia", value: "BC" },
  { label: "Manitoba", value: "MB" },
  { label: "New Brunswick", value: "NB" },
  { label: "Newfoundland and Labrador", value: "NL" },
  { label: "Nova Scotia", value: "NS" },
  { label: "Ontario", value: "ON" },
  { label: "Prince Edward Island", value: "PE" },
  { label: "Quebec", value: "QC" },
  { label: "Saskatchewan", value: "SK" },
  { label: "Northwest Territories", value: "NT" },
  { label: "Nunavut", value: "NU" },
  { label: "Yukon", value: "YT" },
];
export interface EmployeeIncidentReportPopulated {
  _id: string;

  reportType: "Injury" | "Illness" | "Near Miss";

  employee: PopulatedUser;

  jobTitle: string;

  supervisor: PopulatedUser;

  informedSupervisor: boolean;

  injuryDate: string; // ISO date string
  injuryTime: string;

  witnessName?: string;

  location: string;

  activityAtTime: string;

  description: string;

  preventionSuggestion: string;

  injuredBodyPartOrRisk: string;

  sawDoctor: boolean;

  doctorName?: string;
  doctorPhone?: string;

  doctorVisitDate?: string;
  doctorVisitTime?: string;

  previousInjury: boolean;
  previousInjuryDate?: string;

  createdAt: string;
  updatedAt: string;
}
export interface PopulatedUser {
  _id: string;
  firstname: string;
  lastname: string;
  title: string;
}

export interface EmployeeIncidentCredentials {
  type: string;
  employee: string;
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
  injuredBodyPartOrRisk?: string;
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
  preferredContactMethod: ("Phone" | "Email")[];
  complaintNature:
    | "Service Issue"
    | "Product Issue"
    | "Staff Behaviour"
    | "Other";
  complaintDescription: string;
  desiredOutcome: string;
  impact: string;

  otherComplaintText?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface editclientFeedbackCredentials {
  visitDate: Date;
  visitLocation: string;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  preferredContactMethod: ("Phone" | "Email")[];
  complaintNature:
    | "Service Issue"
    | "Product Issue"
    | "Staff Behaviour"
    | "Other";
  complaintDescription: string;
  desiredOutcome: string;
  impact: string;

  otherComplaintText?: string;
}
export interface clientIncidentReport {
  _id: string;
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
export interface editclientIncident {
  incidentDate: Date;
  incidentTime: string;
  incidentPlace: string;
  incidentType: string;
  affectedPerson: string;
  staffName: string;
  staffEmail: string;
  witnessName: string;
  otherincidentText?: string | undefined;
  incidentDescription: string;
  ActionTaken: string;
  debrief: string;
  reportingStaffName: string;
  reportedTo: string;
  reportingDate: Date;
  followup: string;
  reportedToDate: Date;
}
export interface employeeIncidentReport {
  _id: string;
  reportType: "Injury" | "Illness" | "Near Miss";
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
  witnessName?: string;
  doctorName?: string;
  doctorPhone?: string;
  doctorVisitDate?: Date;
  doctorVisitTime?: string;
  previousInjuryDate?: string;
  previousInjury: boolean;
}
export interface editemployeeIncidentReportCred {
  reportType: "Injury" | "Illness" | "Near Miss";
  employee: string;
  jobTitle: string;
  supervisor: string;
  informedSupervisor: boolean;
  injuryDate: Date;
  injuryTime: string;
  location: string;
  activityAtTime: string;
  description: string;
  preventionSuggestion: string;
  injuredBodyPartOrRisk?: string;
  sawDoctor: boolean;
  witnessName?: string;
  doctorName?: string;
  doctorPhone?: string;
  doctorVisitDate?: Date;
  doctorVisitTime?: string;
  previousInjuryDate?: Date;
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
  _id: string;

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
export interface Abilites {
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
}
export interface Restrictions {
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
}
export interface FunctionalAbility {
  _id: string;

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

  abilities?: Abilites;

  restrictions?: Restrictions;

  commentsOnAbilties?: string;

  assessmentDuration?: "1-2 days" | "3-7 days" | "8-14 days" | "14+ days";

  isDiscussRTWtoPatient?: boolean;
  nextAppointmentDate?: Date;

  createdAt?: Date;
  updatedAt?: Date;
  providedTo?: {
    worker: boolean;
    employer: boolean;
  };
  recomendedHours?: "regular" | "modified" | "graduated";
  startDate?: Date;
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
      invalidatesTags: ["client-incident"],
    }),
    editClientIncident: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: editclientIncident }
    >({
      query: ({ id, data }) => ({
        url: `/form/clientIncident/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["client-incident"],
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
      invalidatesTags: ["client-feedback"],
    }),
    editClientFeedBack: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: editclientFeedbackCredentials }
    >({
      query: ({ id, data }) => ({
        url: `/form/clientFeedback/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["client-feedback"],
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
      invalidatesTags: ["employee-incident"],
    }),
    editEmployeeIncident: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: editemployeeIncidentReportCred }
    >({
      query: ({ id, data }) => ({
        url: `/form/employeeIncident/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["employee-incident"],
    }),
    createPaymentRequistion: builder.mutation<ApiGeneralResponse, FormData>({
      query: (formData) => ({
        url: "/form/paymentRequistion",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["payment-requistion"],
    }),
    editPaymentRequistion: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/form/paymentRequistion/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["payment-requistion"],
    }),
    createFAf: builder.mutation<ApiGeneralResponse, any>({
      query: (credentials) => ({
        url: "/form/functionalAbilties",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["functional-abilty"],
    }),
    editFAF: builder.mutation<ApiGeneralResponse, { id: string; creds: any }>({
      query: ({ id, creds }) => ({
        url: `/form/functionalAbilties/${id}`,
        method: "PATCH",
        body: creds,
      }),
      invalidatesTags: ["functional-abilty"],
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
      keepUnusedDataFor: 300,
      providesTags: ["client-feedback"],
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
      keepUnusedDataFor: 300,
      providesTags: ["client-incident"],
    }),
    getAllEmployeeIncidents: builder.query<
      ApiResponse<{
        data: EmployeeIncidentReportPopulated[];
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
      keepUnusedDataFor: 300,
      providesTags: ["employee-incident"],
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
      keepUnusedDataFor: 300,
      providesTags: ["payment-requistion"],
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
      providesTags: ["functional-abilty"],
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
      keepUnusedDataFor: 300,
    }),
    deleteFaf: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/form/functionalAbilties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["functional-abilty"],
    }),
    deletePaymentRequistion: builder.mutation<
      ApiGeneralResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/form/paymentRequistion/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["payment-requistion"],
    }),
    deleteClientFeedback: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/form/functionalAbilties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["client-feedback"],
    }),
    deleteEmployeeIncident: builder.mutation<
      ApiGeneralResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/form/employeeIncident/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["employee-incident"],
    }),

    deleteClientIncident: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/form/clientIncident/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["client-incident"],
    }),
    getFafById: builder.query<ApiResponse<FunctionalAbility>, { id: string }>({
      query: ({ id }) => ({
        url: `/form/functionalAbilties/${id}`,
        method: "GET",
      }),
    }),
    getPaymentRequisitionById: builder.query<
      ApiResponse<PaymentRequisition>,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/form/paymentRequistion/${id}`,
        method: "GET",
      }),
    }),
    getClientFeedbackById: builder.query<
      ApiResponse<clientFeedbackData>,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/form/clientFeedback/${id}`,
        method: "GET",
      }),
    }),
    getClientIncidentById: builder.query<
      ApiResponse<clientIncidentReport>,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/form/clientIncident/${id}`,
        method: "GET",
      }),
    }),
    getEmployeeIncidentById: builder.query<
      ApiResponse<EmployeeIncidentReportPopulated>,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/form/employeeIncident/${id}`,
        method: "GET",
      }),
    }),
    getPaymentRequisitionPdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `/form/paymentRequistion/pdfForm/${id}`,
        method: "GET",
      }),
    }),

    getStaffFeedbackPdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `/form/staffFeedback/pdfForm/${id}`,
        method: "GET",
      }),
    }),

    getClientIncidentPdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `/form/clientIncident/pdfForm/${id}`,
        method: "GET",
      }),
    }),

    getClientFeedbackPdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `/form/clientFeedback/pdfForm/${id}`,
        method: "GET",
      }),
    }),

    getIncidentReportPdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `/form/incidentReport/pdfForm/${id}`,
        method: "GET",
      }),
    }),

    getMediaConsentPdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `/form/mediaConsent/pdfForm/${id}`,
        method: "GET",
      }),
    }),

    getEmployeeIncidentPdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `/form/employeeIncident/pdfForm/${id}`,
        method: "GET",
      }),
    }),

    // deleteFaf: builder.mutation<ApiGeneralResponse, { id: string }>({
    //   query: ({ id }) => ({
    //     url: `/form/functionalAbilties/${id}`,
    //     method: "DELETE",
    //   }),
    // }),
    // deleteFaf: builder.mutation<ApiGeneralResponse, { id: string }>({
    //   query: ({ id }) => ({
    //     url: `/form/functionalAbilties/${id}`,
    //     method: "DELETE",
    //   }),
    // }),
  }),
});

export const {
  useCreateClientFeedbackMutation,
  useCreateClientincidentMutation,
  useCreateEmployeeIncidentMutation,
  useCreatePaymentRequistionMutation,
  useCreateFAfMutation,
  useCreatemediaConsentMutation,
  useLazyGetAllClientFeedbackQuery,
  useLazyGetAllClientIncidentsQuery,
  useLazyGetAllEmployeeIncidentsQuery,
  useLazyGetAllFAFQuery,
  useLazyGetAllMediaConsentQuery,
  useLazyGetAllPaymentRequisitionsQuery,


  useEditClientFeedBackMutation,
  useEditClientIncidentMutation,
  useEditEmployeeIncidentMutation,
  useEditPaymentRequistionMutation,
  useEditFAFMutation,
  useDeleteClientFeedbackMutation,
  useDeleteClientIncidentMutation,
  useDeleteEmployeeIncidentMutation,
  useDeleteFafMutation,
  useDeletePaymentRequistionMutation,
  useGetClientFeedbackByIdQuery,
  useGetClientIncidentByIdQuery,
  useGetEmployeeIncidentByIdQuery,
  useGetFafByIdQuery,
  useGetPaymentRequisitionByIdQuery,
  useLazyGetClientFeedbackPdfQuery,
  useLazyGetClientIncidentPdfQuery,
  useLazyGetEmployeeIncidentPdfQuery,
  useLazyGetIncidentReportPdfQuery,
  useLazyGetMediaConsentPdfQuery,
  useLazyGetPaymentRequisitionPdfQuery,
  useLazyGetStaffFeedbackPdfQuery,
} = FormApi;
