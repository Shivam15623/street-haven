// services/certificationApi.ts
import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";

export type CertificationStatus = "pending" | "approved" | "rejected";

export interface IVolunteer {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface ICertification {
  _id: string;
  volunteer: IVolunteer;
  title: string;
  fileUrl: string;
  issuedBy?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  status: CertificationStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitCertificationBody {
  issuedBy?: string;
  issueDate?: string;
  expiryDate?: string;
  file: File;
}

export interface GetMyCertificationsParams {
  status?: CertificationStatus;
}

export interface GetAllCertificationsParams {
  page?: number;
  limit?: number;
  status?: CertificationStatus;
  volunteer?: string;
}

export interface GetAllCertificationsResponse {
  certifications: ICertification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateCertificationStatusRequest {
  certificationId: string;
  status: "approved" | "rejected";
  remarks?: string;
}

const buildCertificationFormData = (body: SubmitCertificationBody) => {
  const formdata = new FormData();

  if (body.issuedBy) formdata.append("issuedBy", body.issuedBy);
  if (body.issueDate) formdata.append("issueDate", body.issueDate);
  if (body.expiryDate) formdata.append("expiryDate", body.expiryDate);
  formdata.append("file", body.file);
  return formdata;
};

export const certificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    submitCertification: builder.mutation<
      ApiResponse<ICertification>,
      SubmitCertificationBody & {
        onProgress?: (progress: number) => void;
      }
    >({
      async queryFn({ onProgress, ...body }) {
        const upload = uploadWithProgress("/certifications", "POST");

        const result = await upload({
          data: buildCertificationFormData(body),
          onProgress,
        });

        if (result.error) {
          return {
            error: result.error,
          };
        }

        return {
          data: result.data,
        };
      },
      invalidatesTags: ["Certification"],
    }),

    // Volunteer: view own certifications
    // services/certificationApi.ts — key changes
    // Volunteer: view own certifications
    getMyCertification: builder.query<ApiResponse<ICertification[]>, void>({
      query: () => "/certifications/me",
      providesTags: ["Certification"],
    }),

    // Volunteer: withdraw a pending submission
    deleteCertification: builder.mutation<ApiGeneralResponse, string>({
      query: (certificationId) => ({
        url: `/certifications/${certificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Certification"],
    }),

    // Admin: view all, filterable + paginated
    getAllCertifications: builder.query<
      ApiResponse<GetAllCertificationsResponse>,
      GetAllCertificationsParams | void
    >({
      query: (params) => ({
        url: "/certifications",
        params,
      }),
      providesTags: ["Certification"],
    }),

    // Admin: view single certification detail
    getCertificationDetails: builder.query<ApiResponse<ICertification>, string>(
      {
        query: (certificationId) => `/certifications/${certificationId}`,
        providesTags: (_result, _error, id) => [{ type: "Certification", id }],
      },
    ),

    // Admin: approve or reject
    updateCertificationStatus: builder.mutation<
      ApiResponse<ICertification>,
      UpdateCertificationStatusRequest
    >({
      query: ({ certificationId, status, remarks }) => ({
        url: `/certifications/${certificationId}/status`,
        method: "PATCH",
        body: { status, remarks },
      }),
      invalidatesTags: (_result, _error, { certificationId }) => [
        "Certification",
        { type: "Certification", id: certificationId },
      ],
    }),
  }),
});

export const {
  useSubmitCertificationMutation,
  useGetMyCertificationQuery,
  useDeleteCertificationMutation,
  useGetAllCertificationsQuery,
  useGetCertificationDetailsQuery,
  useUpdateCertificationStatusMutation,
} = certificationApi;
