import { EmployeeDepartment, EmployeeRole, EmployeeStatus } from "@prisma/client";

export interface CreateEmployeeDTO {
    name: string;
    email: string;
    department: EmployeeDepartment;
    role: EmployeeRole;
    status?: EmployeeStatus;
    password?: string;
}

export interface UpdateEmployeeDTO {
    name?: string;
    email?: string;
    department?: EmployeeDepartment;
    role?: EmployeeRole;
    status?: EmployeeStatus;
    isSuperAdmin?: boolean;
}

export interface GetEmployeesQueryDTO {
    page?: string;
    limit?: string;
    search?: string;
    department?: string;
    all?: string;
}

export interface PaginatedEmployeesResult {
    employees: any[];
    total: number;
    totalPages: number;
    currentPage: number;
}
