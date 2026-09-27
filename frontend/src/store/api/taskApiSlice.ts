import { apiSlice } from "./apiSlice";
import type { Task } from "../../types";

export interface GetTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  assignedTo?: string;
  all?: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string | null;
  assignedTo?: string | null;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
}

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get tasks with pagination & filtering
    getTasks: builder.query<TasksResponse | Task[], GetTasksParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.priority && params.priority !== "ALL") {
          queryParams.append("priority", params.priority);
        }
        if (params?.assignee && params.assignee !== "ALL") {
          queryParams.append("assignee", params.assignee);
        }
        if (params?.assignedTo && params.assignedTo !== "ALL") {
          queryParams.append("assignedTo", params.assignedTo);
        }
        if (params?.all) queryParams.append("all", "true");

        const queryString = queryParams.toString();
        return `/tasks${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response: { data?: TasksResponse | Task[] } | TasksResponse | Task[]) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as TasksResponse | Task[];
      },
      providesTags: (result) => {
        const list: Task[] = Array.isArray(result)
          ? result
          : (result as TasksResponse)?.tasks || [];
        return [
          { type: "Tasks" as const, id: "LIST" },
          ...list.map(({ id }) => ({ type: "Tasks" as const, id })),
        ];
      },
    }),

    // 2. Get single task by ID
    getTaskById: builder.query<Task, string | undefined>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response: { data?: Task } | Task) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as Task;
      },
      providesTags: (_result, _error, id) => [{ type: "Tasks" as const, id: id || "UNKNOWN" }],
    }),

    // 3. Create a new task
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (newTask) => ({
        url: "/tasks",
        method: "POST",
        body: newTask,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    // 4. Update an existing task
    updateTask: builder.mutation<Task, UpdateTaskRequest>({
      query: ({ id, ...updatedData }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Tasks", id: "LIST" },
        { type: "Tasks", id },
      ],
    }),

    // 5. Delete a task
    deleteTask: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Tasks", id: "LIST" },
        { type: "Tasks", id },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApiSlice;
