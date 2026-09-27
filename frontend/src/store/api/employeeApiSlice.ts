import { apiSlice } from "./apiSlice";
import type { Employee } from "../../types";

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  all?: boolean;
}

export interface EmployeesResponse {
  employees: Employee[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  id: string;
}

export const employeeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get employees with pagination & filtering
    getEmployees: builder.query<EmployeesResponse | Employee[], GetEmployeesParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        if (params?.search) queryParams.append("search", params.search);
        if (params?.all) queryParams.append("all", "true");

        const queryString = queryParams.toString();
        return `/employees${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response: { data?: EmployeesResponse | Employee[] } | EmployeesResponse | Employee[]) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as EmployeesResponse | Employee[];
      },
      providesTags: (result) => {
        const list: Employee[] = Array.isArray(result)
          ? result
          : (result as EmployeesResponse)?.employees || [];
        return [
          { type: "Employees" as const, id: "LIST" },
          ...list.map(({ id }) => ({ type: "Employees" as const, id })),
        ];
      },
    }),

    // 2. Get single employee by ID
    getEmployeeById: builder.query<Employee, string | undefined>({
      query: (id) => `/employees/${id}`,
      transformResponse: (response: { data?: Employee } | Employee) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as Employee;
      },
      providesTags: (_result, _error, id) => [{ type: "Employees" as const, id: id || "UNKNOWN" }],
    }),

    // 3. Create a new employee
    createEmployee: builder.mutation<Employee, CreateEmployeeRequest>({
      query: (newEmployee) => ({
        url: "/employees",
        method: "POST",
        body: newEmployee,
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }],
    }),

    // 4. Update an employee
    updateEmployee: builder.mutation<Employee, UpdateEmployeeRequest>({
      query: ({ id, ...updatedData }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Employees", id: "LIST" },
        { type: "Employees", id },
      ],
    }),

    // 5. Delete an employee
    deleteEmployee: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
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
