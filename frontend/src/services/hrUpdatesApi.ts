import {
  type hrUpdatesResponse,
  type hrUpdatesQuery,
} from "../interfaces/hrUpdatesInterface";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

const hrUpdateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    viewhrUpdates: builder.query<hrUpdatesResponse, hrUpdatesQuery>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        order = "desc",
      }) => ({
        url: "/hr-updates/view",
        params: { page, limit, search, sortBy, order },
      }),
      providesTags: ["HrUpdates"],
    }),
    createhrUpdates: builder.mutation({
      query: (credentials) => ({
        url: "/hr-updates/create",
        method:"POST",
        body: credentials,
      }),
      invalidatesTags: ["HrUpdates"],
    }),
    edithrupdates: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/hr-updates/edit/${id}`,
        method:"PATCH",
        body: data,
      }),
      invalidatesTags: ["HrUpdates"],
    }),
    deletehrupdates: builder.mutation<ApiGeneralResponse, string>({
      query: (id) => ({
        url: `hr-updates/delete/${id}`,
        method:"DELETE",
      }),
      invalidatesTags: ["HrUpdates"],
    }),
  }),
});
export const {
  useViewhrUpdatesQuery,
  useCreatehrUpdatesMutation,
  useEdithrupdatesMutation,
  useDeletehrupdatesMutation,
} = hrUpdateApi;
