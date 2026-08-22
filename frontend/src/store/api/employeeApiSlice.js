import { apiSlice } from "./apiSlice";

export const employeeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get employees with pagination & filtering
    getEmployees: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);
        if (params.search) queryParams.append("search", params.search);
        if (params.department && params.department !== "ALL") {
          queryParams.append("department", params.department);
        }
        if (params.all) queryParams.append("all", "true");

        const queryString = queryParams.toString();
        return `/employees${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response) => response.data || response,
      providesTags: (result) => {
        const list = Array.isArray(result)
          ? result
          : result?.employees || [];
        return [
          { type: "Employees", id: "LIST" },
          ...list.map(({ id }) => ({ type: "Employees", id })),
        ];
      },
    }),

    // 2. Get single employee by ID
    getEmployeeById: builder.query({
      query: (id) => `/employees/${id}`,
      transformResponse: (response) => response.data || response,
      providesTags: (result, error, id) => [{ type: "Employees", id }],
    }),

    // 3. Create a new employee
    createEmployee: builder.mutation({
      query: (newEmployee) => ({
        url: "/employees",
        method: "POST",
        body: newEmployee,
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }],
    }),

    // 4. Update an employee
    updateEmployee: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Employees", id: "LIST" },
        { type: "Employees", id },
      ],
    }),

    // 5. Delete an employee
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Employees", id: "LIST" },
        { type: "Employees", id },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApiSlice;
