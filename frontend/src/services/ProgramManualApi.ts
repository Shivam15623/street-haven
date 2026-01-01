import type {
  ProgramManualsQuery,
  ProgrammMannualsResponse,
} from "../interfaces/programMannuals";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";

const programManualsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchManuals: builder.query<ProgrammMannualsResponse, ProgramManualsQuery>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        slug = "",
        type,
        sortBy = "createdAt",
        order = "desc",
      }) => ({
        url: "/program-manuals/view",
        method: "GET",
        params: { page, limit, search, type, slug, sortBy, order },
      }),
      keepUnusedDataFor: 300,
      providesTags: ["Manual"],
    }),
    createManuals: builder.mutation({
      queryFn: ({ data, onProgress }) =>
        uploadWithProgress(
          "/program-manuals/create",
          "POST"
        )({
          data,
          onProgress,
        }),

      invalidatesTags: ["Manual"],
    }),

    editManuals: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: FormData; onProgress?: (p: number) => void }
    >({
      queryFn: ({ id, data, onProgress }) =>
        uploadWithProgress(
          `/program-manuals/edit/${id}`,
          "PATCH"
        )({
          data,
          onProgress,
        }),
      invalidatesTags: ["Manual"],
    }),

    deleteManuals: builder.mutation({
      query: (id: string) => ({
        url: `/program-manuals/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Manual"],
    }),
  }),
});

export const {
  useCreateManualsMutation,
  useDeleteManualsMutation,
  useEditManualsMutation,
  useFetchManualsQuery,
} = programManualsApi;
