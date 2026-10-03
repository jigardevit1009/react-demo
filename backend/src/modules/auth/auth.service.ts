import jwt from "jsonwebtoken";
import { AppError } from "../../common/AppError";
import prisma from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/password.util";
import {
    AuthResponseData,
    ForgotPasswordDTO,
    LoginDTO,
    RegisterDTO,
    UpdateProfileDTO,
    ChangePasswordDTO,
} from "./auth.types";
import { EmployeeStatus } from "@prisma/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string {
    if (!email || !email.trim()) {
        throw new AppError("Email is required", 400);
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
        throw new AppError("Please provide a valid email address", 400);
    }
    return cleanEmail;
}

function validatePassword(password: string, fieldName = "Password"): void {
    if (!password || password.trim().length === 0) {
        throw new AppError(`${fieldName} is required`, 400);
    }
    if (password.length < 6) {
        throw new AppError(`${fieldName} must be at least 6 characters long`, 400);
    }
}

export class AuthService {

    // Register Business Logic
    async register(data: RegisterDTO): Promise<AuthResponseData> {
        const { name, email, password, role } = data;

        if (!name || !name.trim()) {
            throw new AppError("Full name is required", 400);
        }
        if (name.trim().length < 2) {
            throw new AppError("Full name must be at least 2 characters long", 400);
        }

        const normalizedEmail = validateEmail(email);
        validatePassword(password, "Password");

        // Check if email already exists
        const existing = await prisma.employee.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            throw new AppError("An account with this email already exists", 400);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new Employee (default isSuperAdmin = false)
        const employee = await prisma.employee.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: role?.trim() || "Software Developer",
                status: EmployeeStatus.Active,
                isSuperAdmin: false,
            },
        });

        // Generate JWT
        const token = this.generateToken(employee.id, employee.email, employee.isSuperAdmin, employee.role);

        return {
            token,
            user: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                status: employee.status,
                isSuperAdmin: employee.isSuperAdmin,
            },
        };
    }

    // Login Business Logic
    async login(data: LoginDTO): Promise<AuthResponseData> {
        const { email, password } = data;

        if (!password) {
            throw new AppError("Password is required", 400);
        }

        const normalizedEmail = validateEmail(email);

        const employee = await prisma.employee.findUnique({ where: { email: normalizedEmail } });
        if (!employee) {
            throw new AppError("Invalid email or password", 401);
        }

        const isMatch = await comparePassword(password, employee.password);
        if (!isMatch) {
            throw new AppError("Invalid email or password", 401);
        }

        const token = this.generateToken(employee.id, employee.email, employee.isSuperAdmin, employee.role);

        return {
            token,
            user: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                status: employee.status,
                isSuperAdmin: employee.isSuperAdmin,
            },
        };
    }

    // Get Authenticated Profile
    async getProfile(employeeId: string) {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                isSuperAdmin: true,
                createdAt: true,
            },
        });
        if (!employee) {
            throw new AppError("Employee profile not found", 404);
        }
        return employee;
    }

    // Update Profile (Name, Role)
    async updateProfile(userId: string, data: UpdateProfileDTO) {
        const { name, role } = data;

        if (name !== undefined && name.trim().length < 2) {
            throw new AppError("Name must be at least 2 characters long", 400);
        }

        const employee = await prisma.employee.findUnique({ where: { id: userId } });
        if (!employee) {
            throw new AppError("User not found", 404);
        }

        const updated = await prisma.employee.update({
            where: { id: userId },
            data: {
                ...(name ? { name: name.trim() } : {}),
                ...(role ? { role: role.trim() } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                isSuperAdmin: true,
                createdAt: true,
            },
        });

        return updated;
    }

    // Change Password
    async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
        const { currentPassword, newPassword } = data;

        if (!currentPassword) {
            throw new AppError("Current password is required", 400);
        }

        validatePassword(newPassword, "New password");

        if (currentPassword === newPassword) {
            throw new AppError("New password must be different from current password", 400);
        }

        const employee = await prisma.employee.findUnique({ where: { id: userId } });
        if (!employee) {
            throw new AppError("User not found", 404);
        }

        const isMatch = await comparePassword(currentPassword, employee.password);
        if (!isMatch) {
            throw new AppError("Current password does not match", 400);
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.employee.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    // Forgot Password
    async resetPassword(data: ForgotPasswordDTO): Promise<void> {
        const { email, newPassword } = data;

        const normalizedEmail = validateEmail(email);
        validatePassword(newPassword, "New password");

        const employee = await prisma.employee.findUnique({ where: { email: normalizedEmail } });
        if (!employee) {
            throw new AppError("No account found with that email", 404);
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.employee.update({
            where: { email: normalizedEmail },
            data: { password: hashedPassword },
        });
    }

    // Helper method: JWT Signer
    private generateToken(id: string, email: string, isSuperAdmin: boolean, role?: string): string {
        return jwt.sign(
            { id, email, isSuperAdmin, role },
            process.env.JWT_SECRET || "react_demo_2026",
            { expiresIn: "7d" }
        );
    }
}

export default new AuthService();