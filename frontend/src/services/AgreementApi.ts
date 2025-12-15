import { api } from "../redux/ApiSlice";
import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { uploadWithProgress } from "../utills/uploadWithProgress";

export interface AgreementData {
  _id: string;
  title: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number;
    fileType: string;
  };
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  updatedAt: Date;
  createdAt: Date;
}
type AgreementResponse = ApiResponse<AgreementData[]>;

const AgreementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAgreement: builder.mutation({
      queryFn: ({ data, onProgress }) =>
        uploadWithProgress(
          "/collective-agreements/create",
          "POST"
        )({
          data,
          onProgress,
        }),
      invalidatesTags: ["Agreement"],
    }),
    editAgreement: builder.mutation<
      ApiGeneralResponse,
      { id: string; formData: FormData; onProgress?: (p: number) => void }
    >({
      queryFn: ({ id, formData, onProgress }) =>
        uploadWithProgress(
          `/collective-agreements/edit/${id}`,
          "PATCH"
        )({
          data: formData,
          onProgress,
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
