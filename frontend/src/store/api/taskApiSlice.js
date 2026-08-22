import { apiSlice } from "./apiSlice";

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get tasks with pagination & filtering
    getTasks: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);
        if (params.search) queryParams.append("search", params.search);
        if (params.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params.priority && params.priority !== "ALL") {
          queryParams.append("priority", params.priority);
        }
        if (params.all) queryParams.append("all", "true");

        const queryString = queryParams.toString();
        return `/tasks${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response) => response.data || response,
      providesTags: (result) => {
        const list = Array.isArray(result)
          ? result
          : result?.tasks || [];
        return [
          { type: "Tasks", id: "LIST" },
          ...list.map(({ id }) => ({ type: "Tasks", id })),
        ];
      },
    }),

    // 2. Get single task by ID
    getTaskById: builder.query({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response) => response.data || response,
      providesTags: (result, error, id) => [{ type: "Tasks", id }],
    }),

    // 3. Create a new task (supports numeric assigneeId)
    createTask: builder.mutation({
      query: (newTask) => ({
        url: "/tasks",
        method: "POST",
        body: newTask,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    // 4. Update an existing task
    updateTask: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tasks", id: "LIST" },
        { type: "Tasks", id },
      ],
    }),

    // 5. Delete a task
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
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
