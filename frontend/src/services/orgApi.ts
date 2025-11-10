import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
interface orgNodeCredential {
  label: string;
  reportsTo: string | null;
  department: string;
}

export interface OrgNodeData {
  _id: string;
  label: string;
  reportsTo: {
    _id: string;
    label: string;
  } | null;
  department: string;
  supervises: {
    _id: string;
    label: string;
  }[];
}
type OrgNodesResponse = ApiResponse<OrgNodeData[]>;
export const OrgApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTreeNodes: builder.query<OrgNodesResponse, void>({
      query: () => ({
        url: "/orgNode/allNodes",
        method: "GET",
      }),
      providesTags: ["OrgNode"],
    }),
    editNode: builder.mutation<
      ApiGeneralResponse,
      { id: string; update: orgNodeCredential }
    >({
      query: ({ id, update }) => ({
        url: `/orgNode/editNode/${id}`,
        method: "PATCH",
        body: { ...update },
      }),
      invalidatesTags: ["OrgNode"],
    }),
    addNode: builder.mutation<ApiGeneralResponse, orgNodeCredential>({
      query: (credential) => ({
        url: `/orgNode/addNode`,
        method: "POST",
        body: credential,
      }),
      invalidatesTags: ["OrgNode"],
    }),
    deleteNode: builder.mutation({
      query: ({ id }) => ({
        url: `/orgNode/deleteNode/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrgNode"],
    }),
  }),
});

export const {
  useGetTreeNodesQuery,
  useAddNodeMutation,
  useEditNodeMutation,
  useDeleteNodeMutation,
} = OrgApi;
