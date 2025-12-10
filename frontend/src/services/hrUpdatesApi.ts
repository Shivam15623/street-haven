import {
  type hrUpdatesResponse,
  type hrUpdatesQuery,
} from "../interfaces/hrUpdatesInterface";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";

const hrUpdateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    viewhrUpdates: builder.query<hrUpdatesResponse, hrUpdatesQuery>({
      query: ({
        page = 1,
        limit = 10,
        slug = "",
        search = "",
        sortBy = "createdAt",
        order = "desc",
      }) => ({
        url: "/hr-updates/view",
        params: { page, limit, search, sortBy, slug, order },
      }),
      providesTags: ["HrUpdates"],
    }),
    createhrUpdates: builder.mutation({
      queryFn: ({ data, onProgress }) =>
        uploadWithProgress(
          "/hr-updates/create",
          "POST"
        )({
          data,
          onProgress,
        }),

      invalidatesTags: ["HrUpdates"],
    }),
    edithrupdates: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: FormData; onProgress?: (p: number) => void }
    >({
      queryFn: ({ id, data, onProgress }) =>
        uploadWithProgress(
          `/hr-updates/edit/${id}`,
          "PATCH"
        )({
          data,
          onProgress,
        }),

      invalidatesTags: ["HrUpdates"],
    }),
    deletehrupdates: builder.mutation<ApiGeneralResponse, string>({
      query: (id) => ({
        url: `hr-updates/delete/${id}`,
        method: "DELETE",
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
