import { api } from "../redux/ApiSlice";

export const OrgApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTreeNodes: builder.query({
      query: () => ({
        url: "/orgNode/allNodes",
        method: "GET",
      }),
      providesTags: ["OrgNode"],
    }),
    editNode: builder.mutation({
      query: ({ id }) => ({
        url: `/orgNode/editNode/${id}`,
        method: "PATCH",
      }),
    }),
    addNode: builder.mutation({
      query: () => ({
        url: `/orgNode/addNode`,
        method: "POST",
      }),
    }),
    deleteNode: builder.mutation({
      query: ({ id }) => ({
        url: `/orgNode/deleteNode/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetTreeNodesQuery,
  useAddNodeMutation,
  useEditNodeMutation,
  useDeleteNodeMutation,
} = OrgApi;
