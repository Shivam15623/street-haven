import { api } from "../redux/ApiSlice";
import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";

export interface AgreementData {
  _id: string;
  title: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number;
    totalPages: number;
  };
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  updatedAt: Date;
  createdAt: Date;
}
type AgreementResponse = ApiResponse<AgreementData[]>;

const AgreementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAgreement: builder.mutation<ApiGeneralResponse, FormData>({
      query: (formData) => ({
        url: "/collective-agreements/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Agreement"],
    }),
    editAgreement: builder.mutation<
      ApiGeneralResponse,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/collective-agreements/edit/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Agreement"],
    }),
    fetchAgreements: builder.query<AgreementResponse, void>({
      query: () => ({
        url: "/collective-agreements",
        method: "GET",
      }),
      providesTags: ["Agreement"],
    }),
    deleteAgreement: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/collective-agreements/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Agreement"],
    }),
  }),
});

export const {
  useCreateAgreementMutation,
  useFetchAgreementsQuery,
  useEditAgreementMutation,
  useDeleteAgreementMutation,
} = AgreementApi;
