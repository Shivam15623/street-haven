import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";
import type { commentResponse } from "./ticketApi";

export type TaskStatus = "assigned" | "under_review" | "completed";

export interface IUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface IStatusHistory {
  status: TaskStatus;
  changedBy: IUser;
  changedAt: string;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  assignedTo: IUser;
  assignedBy: IUser;
  status: TaskStatus;
  dueDate: string | null;
  statusHistory: IStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskBody {
  title: string;
  description: string;
  assignedTo: string;
  dueDate?: string | null;
}

export interface EditTaskBody {
  title?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string | null;
  status?: TaskStatus;
}

export interface GetTasksResponse {
  tasks: ITask[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
export interface EditTaskRequest {
  taskId: string;
  body: EditTaskBody;
}

export interface UpdateTaskStatusRequest {
  taskId: string;
  status: TaskStatus;
}

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation<ApiResponse<ITask>, CreateTaskBody>({
      query: (body) => ({
        url: "/task",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Task"],
    }),

    getAllTasks: builder.query<
      ApiResponse<GetTasksResponse>,
      GetTasksParams | void
    >({
      query: (params) => ({
        url: "/task",
        params,
      }),
      providesTags: ["Task"],
    }),

    getTaskDetails: builder.query<ApiResponse<ITask>, string>({
      query: (taskId) => `/task/${taskId}`,
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),

    editTask: builder.mutation<ApiResponse<ITask>, EditTaskRequest>({
      query: ({ taskId, body }) => ({
        url: `/task/${taskId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        "Task",
        { type: "Task", id: taskId },
      ],
    }),

    deleteTask: builder.mutation<ApiGeneralResponse, string>({
      query: (taskId) => ({
        url: `/task/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),

    updateTaskStatus: builder.mutation<
      ApiResponse<ITask>,
      UpdateTaskStatusRequest
    >({
      query: ({ taskId, status }) => ({
        url: `/task/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        "Task",
        { type: "Task", id: taskId },
      ],
    }),
    addTaskComment: builder.mutation<
      ApiGeneralResponse,
      { taskId: string; formdata: FormData; onProgress?: (p: number) => void }
    >({
      queryFn: ({ taskId, formdata, onProgress }) =>
        uploadWithProgress(
          `/task/${taskId}/comments`,
          "POST",
        )({
          data: formdata,
          onProgress,
        }),
    }),
    viewTaskComments: builder.query<
      commentResponse,
      { page: number; limit: number; taskId: string }
    >({
      query: ({ taskId, page, limit }) => ({
        url: `/task/${taskId}/comments`,
        method: "GET",
        params: { page, limit },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetAllTasksQuery,
  useGetTaskDetailsQuery,
  useEditTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
  useAddTaskCommentMutation,
  useViewTaskCommentsQuery,
  useLazyViewTaskCommentsQuery,
} = taskApi;
