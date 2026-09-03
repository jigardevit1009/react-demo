import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../../common/AppError";
import prisma from "../../config/prisma";
import { AuthResponseData, ForgotPasswordDTO, LoginDTO, RegisterDTO } from "./auth.types";
import { EmployeeDepartment, EmployeeRole, EmployeeStatus } from "@prisma/client";

export class AuthService {

    //Register Business Logic
    async register(data: RegisterDTO): Promise<AuthResponseData> {
        const { name, email, password, department, role } = data;

        if (!name || !email || !password) {
            throw new AppError("Name, email, and password are required", 400);
        }

        // Check if email already exists
        const existing = await prisma.employee.findUnique({ where: { email } });
        if (existing) {
            throw new AppError("An account with this email already exists", 400);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new Employee (default isSuperAdmin = false)
        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                password: hashedPassword,
                department: department || EmployeeDepartment.Engineering,
                role: role || EmployeeRole.Employee,
                status: EmployeeStatus.Active || "Active",
                isSuperAdmin: false,
            },
        });

        // Generate JWT
        const token = this.generateToken(employee.id, employee.email, employee.isSuperAdmin);

        return {
            token,
            user: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                department: employee.department,
                role: employee.role,
                status: employee.status,
                isSuperAdmin: employee.isSuperAdmin,
            },
        };

    }

    //Login Business Logic
    async login(data: LoginDTO): Promise<AuthResponseData> {
        const { email, password } = data;

        if (!email || !password) {
            throw new AppError("Email and password are required", 400);
        }

        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) {
            throw new AppError("Invalid email or password", 401);
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            throw new AppError("Invalid email or password", 401);
        }

        const token = this.generateToken(employee.id, employee.email, employee.isSuperAdmin);

        return {
            token,
            user: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                department: employee.department,
                role: employee.role,
                status: employee.status,
                isSuperAdmin: employee.isSuperAdmin,
            },
        };
    }

    //Get Authenticated Profile
    async getProfile(employeeId: string) {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
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

    //Forgot Password
    async resetPassword(data: ForgotPasswordDTO): Promise<void> {
        const { email, newPassword } = data;

        if (!email || !newPassword) {
            throw new AppError("Email and new password are required", 400);
        }

        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) {
            throw new AppError("No account found with that email", 404);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.employee.update({
            where: { email },
            data: { password: hashedPassword },
        });
    }


    // Helper method: JWT Signer
    private generateToken(id: string, email: string, isSuperAdmin: boolean): string {
        return jwt.sign(
            { id, email, isSuperAdmin },
            process.env.JWT_SECRET || "react_demo_2026",
            { expiresIn: "7d" }
        );
    }

}

export default new AuthService();