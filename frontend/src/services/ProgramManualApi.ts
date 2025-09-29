import type {
  ProgramManualsQuery,
  ProgrammMannualsResponse,
} from "../interfaces/programMannuals";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

const programManualsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchManuals: builder.query<ProgrammMannualsResponse, ProgramManualsQuery>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        slug="",
        type,
        sortBy = "createdAt",
        order = "desc",
      }) => ({
        url: "/program-manuals/view",
        method: "GET",
        params: { page, limit, search, type,slug, sortBy, order },
      }),
      providesTags:["Manual"]
    }),
    createManuals: builder.mutation<ApiGeneralResponse, FormData>({
      query: (credentials) => ({
        url: "/program-manuals/create",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags:["Manual"]
    }),
    editManuals: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/program-manuals/edit/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags:["Manual"]
    }),
    deleteManuals: builder.mutation({
      query: (id: string) => ({
        url: `/program-manuals/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags:["Manual"]
    }),
  }),
});

export const {
  useCreateManualsMutation,
  useDeleteManualsMutation,
  useEditManualsMutation,
  useFetchManualsQuery,
} = programManualsApi;
