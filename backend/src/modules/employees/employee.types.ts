import { EmployeeStatus } from "@prisma/client";

export interface CreateEmployeeDTO {
    name: string;
    email: string;
    role: string;
    status?: EmployeeStatus;
    password?: string;
}

export interface UpdateEmployeeDTO {
    name?: string;
    email?: string;
    role?: string;
    status?: EmployeeStatus;
    isSuperAdmin?: boolean;
}

export interface GetEmployeesQueryDTO {
    page?: string;
    limit?: string;
    search?: string;
    all?: string;
}

export interface PaginatedEmployeesResult {
    employees: any[];
    total: number;
    totalPages: number;
    currentPage: number;
}
