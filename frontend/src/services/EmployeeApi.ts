import type { Role, SignupCredentials } from "../interfaces/AuthInterfaces";
import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import type { AllPermissions } from "../utills/auth/permissions";
export interface EmployeeData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNo: string;
  role: Role;
  profilePic: string;
  createdAt: string;
  updatedAt: string;
  superviserId: string;
  locations:string[];
  title: string;
  hireDate: Date;

  customPermissions: AllPermissions[];
}
export interface EmployeeSuperviserData {
  _id: string;
  firstname: string;
  lastname: string;
  title: string;
  superviser: {
    firstname: string;
    lastname: string;
    title: string;
    _id: string;
  };
}
export type EmployeeSupFormResponse = ApiResponse<EmployeeSuperviserData[]>;
export interface RoleForm {
  roleName: string;
  description: string;
  permissions: ModulePermission[];
}
export interface Feature {
  key: string;
  label: string;
  allowed: boolean;
}

export interface ModulePermission {
  moduleName: string;
  moduleKey: string;
  access: boolean;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  features: Feature[];
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
  role?: Role;
}
export interface RoleInfo {
  _id: string;
  roleName: string;
  description: string;
  permissions: ModulePermission[];
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
        role,
      }) => ({
        url: "/employees/view",
        method: "GET",
        params: { page, limit, search, sortBy, order, forDropdown, role },
      }),
      keepUnusedDataFor: 300,
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
    addRole: builder.mutation<ApiGeneralResponse, RoleForm>({
      query: (credentials) => ({
        url: "/employees/role/create",
        method: "POST",
        body: credentials,
      }),
    }),
    editRole: builder.mutation<
      ApiGeneralResponse,
      { id: string; updated: RoleForm }
    >({
      query: ({ id, updated }) => ({
        url: `/employees/role/edit/${id}`,
        method: "PATCH",
        body: updated,
      }),
    }),
    deleteRole: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/employees/role/delete/${id}`,
        method: "DELETE",
      }),
    }),
    viewRoles: builder.query<
      ApiResponse<{ _id: string; roleName: string }[]>,
      { formOnly: boolean }
    >({
      query: ({ formOnly }) => ({
        url: `/employees/role`,
        body: { formOnly },
        method: "POST",
      }),
    }),
    getRolebyId: builder.query<ApiResponse<RoleInfo>, { id: string }>({
      query: ({ id }) => ({
        url: `/employees/role/${id}`,
        method: "GET",
      }),
    }),
    resetTotp: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `employees/resetTotp/${id}`,
        method: "PATCH",
      }),
    }),
    employeeSuperForm: builder.query<EmployeeSupFormResponse, void>({
      query: () => ({
        url: "employees/form-superviser",
        method: "GET",
      }),
    }),
    fetchEmployeeById: builder.query<
      ApiResponse<{
        employee: {
          _id: string;
          firstname: string;
          lastname: string;
          email: string;
          phoneNo: string;
          role: Role;
          profilePic: string;
          superviserId: string;
          title: string;
          hireDate: Date;
        };
      }>,
      { id: string; orgChart: boolean }
    >({
      query: ({ id, orgChart }) => ({
        url: `/employees/${id}`,
        method: "GET",
        params: orgChart ? { orgChart: "true" } : undefined,
      }),
    }),
  }),
});

export const {
  useAllEmployeesQuery,
  useEditEmployeeMutation,
  useDeleteEmployeeMutation,
  useAddEmployeeMutation,
  useAddRoleMutation,
  useEditRoleMutation,
  useDeleteRoleMutation,
  useViewRolesQuery,
  useGetRolebyIdQuery,
  useResetTotpMutation,
  useEmployeeSuperFormQuery,
  useLazyEmployeeSuperFormQuery,
  useLazyFetchEmployeeByIdQuery,
} = EmployeeApi;
