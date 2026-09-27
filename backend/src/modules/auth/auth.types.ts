// backend/src/modules/auth/auth.types.ts
import { EmployeeStatus } from "@prisma/client";

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface ForgotPasswordDTO {
    email: string;
    newPassword: string;
}

export interface UpdateProfileDTO {
    name?: string;
    role?: string;
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}

export interface AuthResponseData {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: EmployeeStatus;
        isSuperAdmin: boolean;
    };
}
