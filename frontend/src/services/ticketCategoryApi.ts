import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";


export interface TicketCategory {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface GetTicketCategoriesParams {
  isActive?: "true" | "false" | "all";
}

interface CreateTicketCategoryBody {
  name: string;
}

interface EditTicketCategoryArgs {
  id: string;
  name: string;
}

const ticketCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTicketCategories: builder.query<
      ApiResponse<TicketCategory[]>,
      GetTicketCategoriesParams
    >({
      query: ({ isActive }) => ({
        url: "/ticket-category",
        method: "GET",
        params: { isActive },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "TicketCategory" as const,
                id: _id,
              })),
              { type: "TicketCategory" as const, id: "LIST" },
            ]
          : [{ type: "TicketCategory" as const, id: "LIST" }],
    }),

    createTicketCategory: builder.mutation<
      ApiResponse<TicketCategory>,
      CreateTicketCategoryBody
    >({
      query: (body) => ({
        url: "/ticket-category",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "TicketCategory", id: "LIST" }],
    }),

    editTicketCategory: builder.mutation<
      ApiResponse<TicketCategory>,
      EditTicketCategoryArgs
    >({
      query: ({ id, name }) => ({
        url: `/ticket-category/${id}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "TicketCategory", id },
        { type: "TicketCategory", id: "LIST" },
      ],
    }),

    deleteTicketCategory: builder.mutation<ApiGeneralResponse, string>({
      query: (id) => ({
        url: `/ticket-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result,_error, id) => [
        { type: "TicketCategory", id },
        { type: "TicketCategory", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTicketCategoriesQuery,
  useCreateTicketCategoryMutation,
  useEditTicketCategoryMutation,
  useDeleteTicketCategoryMutation,
} = ticketCategoryApi;