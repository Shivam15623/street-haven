import type { FileType } from "../interfaces/fileinterface";
import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
import { uploadWithProgress } from "../utills/uploadWithProgress";

export type TaskStatus = "new" | "assigned" | "under_review" | "completed";

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
  dueStatus: "overdue" | "upcoming" | "today" | "noduedate";
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
  counts: {
    new: number;
    assigned: number;
    under_review: number;
    completed: number;
  };
}

export type TaskDateType = "created" | "updated" | "due";

export type TaskDatePreset = "today" | "week" | "month" | "year";

export type TaskDueStatus = "overdue" | "upcoming" | "today" | "noduedate";

export type TaskSearchBy = "title" | "description" | "both";

export interface GetTasksParams {
  page?: number;
  limit?: number;

  search?: string;
  searchBy?: TaskSearchBy;

  startDate?: string | Date;
  endDate?: string | Date;

  dateType?: TaskDateType;
  datePreset?: TaskDatePreset;

  status?: TaskStatus | TaskStatus[];

  assignedTo?: string | string[];
  assignedBy?: string | string[];

  dueStatus?: TaskDueStatus;

  hasDueDate?: "" | "true" | "false";

  isCompleted?: "" | "true" | "false";

  sortBy?:
    | "title"
    | "status"
    | "dueDate"
    | "dueStatus"
    | "createdAt"
    | "updatedAt";

  sortOrder?: "asc" | "desc";
}
export interface EditTaskRequest {
  taskId: string;
  body: EditTaskBody;
}

export interface UpdateTaskStatusRequest {
  taskId: string;
  status: TaskStatus;
}
export interface TaskTimelineUser {
  _id: string | null;
  firstname: string;
  lastname: string;
  email: string | null;
}

export interface TaskActivityTimelineItem {
  _id: string;
  itemType: "activity";
  action: "created" | "status_change" | "assignee_change" | "due_date_change";
  field: string;
  fromValue: string | null;
  toValue: string | null;
  note: string;
  userId: TaskTimelineUser;
  createdAt: string;
}

export interface TaskCommentTimelineItem {
  _id: string;
  itemType: "comment";
  message: string;
  attachments?: {
    _id: string;
    size: number;
    fileName: string;
    fileUrl: string;
    type: FileType;
  }[];
  userId: TaskTimelineUser | null;
  createdAt: string;
}

export type TaskTimelineItem =
  | TaskActivityTimelineItem
  | TaskCommentTimelineItem;

// pagination is now cursor-based, not page-based
export interface GetTaskTimelineResponseData {
  items: TaskTimelineItem[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}
export interface TaskDetail {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  assignedTo: TaskTimelineUser | null;
  assignedBy: TaskTimelineUser;
  createdAt: string;
  updatedAt: string;
}
export interface TaskDetailData {
  task: TaskDetail;
  activity: TaskActivityTimelineItem[];
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
    getTaskBySlug: builder.query<ApiResponse<ITask>, string>({
      query: (slug) => ({
        url: `/task/slug/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "Task", id: slug }],
    }),
    getAllTasks: builder.query<
      ApiResponse<GetTasksResponse>,
      GetTasksParams | void
    >({
      query: (params) => {
        if (!params) {
          return {
            url: "/task",
          };
        }

        const queryParams = Object.fromEntries(
          Object.entries(params).filter(([_, value]) => {
            if (value === undefined || value === null || value === "")
              return false;
            if (Array.isArray(value) && value.length === 0) return false;
            return true;
          }),
        );

        return {
          url: "/task",
          params: queryParams,
        };
      },
      providesTags: ["Task"],
    }),

    exportTaskReport: builder.mutation<
      Blob,
      {
        search?: string;

        startDate?: string | Date;
        endDate?: string | Date;

        dateType?: TaskDateType;
        datePreset?: TaskDatePreset;

        status?: TaskStatus | TaskStatus[];

        assignedTo?: string | string[];
        assignedBy?: string | string[];

        dueStatus?: TaskDueStatus;

        hasDueDate?: "" | "true" | "false";

        isCompleted?: "" | "true" | "false";
      }
    >({
      query: ({
        search,
        startDate,
        endDate,
        dateType,
        datePreset,
        status,
        assignedTo,
        assignedBy,
        dueStatus,
        hasDueDate,
        isCompleted,
      }) => ({
        url: `/task/report/export`,
        method: "GET",
        params: {
          search,
          startDate,
          endDate,
          dateType,
          datePreset,
          status,
          assignedTo,
          assignedBy,
          dueStatus,
          hasDueDate,
          isCompleted,
        },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
    getTaskDetails: builder.query<ApiResponse<TaskDetailData>, string>({
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
      ApiResponse<GetTaskTimelineResponseData>,
      { taskId: string; limit: number; cursor?: string | null }
    >({
      query: ({ taskId, limit, cursor }) => ({
        url: `/task/${taskId}/comments`,
        method: "GET",
        params: {
          limit,
          ...(cursor ? { cursor } : {}),
        },
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
  useLazyGetTaskDetailsQuery,
  useExportTaskReportMutation,
  useGetTaskBySlugQuery
} = taskApi;
