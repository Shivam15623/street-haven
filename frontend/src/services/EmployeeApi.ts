import type { SignupCredentials } from "../interfaces/AuthInterfaces";
import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface EmployeeData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNo: string;
  role: "admin" | "employee";
  profilePic: string;
  createdAt: string;
  updatedAt: string;
}
type EmployeesResponse = ApiResponse<{
  employees: EmployeeData[];
  paggination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;
interface AllEmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  forDropdown?: boolean;
}
const EmployeeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    allEmployees: builder.query<EmployeesResponse, AllEmployeeQuery>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        order = "desc",
        forDropdown = false,
      }) => ({
        url: "/employees/view",
        method: "GET",
        params: { page, limit, search, sortBy, order, forDropdown },
      }),
      providesTags: ["Employees"],
    }),
    editEmployee: builder.mutation<
      ApiGeneralResponse,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/employees/edit/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Employees"],
    }),
    deleteEmployee: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/employees/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employees"],
    }),
    addEmployee: builder.mutation<ApiGeneralResponse, SignupCredentials>({
      query: (credentials) => ({
        url: "/employees/add",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Employees"],
    }),
  }),
});

export const {
  useAllEmployeesQuery,
  useEditEmployeeMutation,
  useDeleteEmployeeMutation,
  useAddEmployeeMutation,
} = EmployeeApi;
