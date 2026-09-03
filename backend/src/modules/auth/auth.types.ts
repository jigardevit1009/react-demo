// backend/src/modules/auth/auth.types.ts
import { EmployeeDepartment, EmployeeRole, EmployeeStatus } from "@prisma/client";

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    department?: EmployeeDepartment;
    role?: EmployeeRole;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface ForgotPasswordDTO {
    email: string;
    newPassword: string;
}

export interface AuthResponseData {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        department: EmployeeDepartment;
        role: EmployeeRole;
        status: EmployeeStatus;
        isSuperAdmin: boolean;
    };
}
