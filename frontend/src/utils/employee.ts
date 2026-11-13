import type { Employee } from "../types";
import type { EmployeesResponse } from "../store/api/employeeApiSlice";

/** The employees API returns either a plain array or a paginated object. */
export function toEmployeeList(data?: EmployeesResponse | Employee[]): Employee[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.employees || [];
}
