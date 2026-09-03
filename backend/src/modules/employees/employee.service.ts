import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";
import { AppError } from "../../common/AppError";
import {
    CreateEmployeeDTO,
    UpdateEmployeeDTO,
    GetEmployeesQueryDTO,
    PaginatedEmployeesResult,
} from "./employee.types";
import { EmployeeDepartment, EmployeeRole, EmployeeStatus, Prisma } from "@prisma/client";

export class EmployeeService {
    //Get Paginated & Filtered Employees (or All for dropdowns)
    async getEmployees(query: GetEmployeesQueryDTO): Promise<PaginatedEmployeesResult | any[]> {

        const { page = "1", limit = "10", search, department, all } = query;

        // Fast path: Return all employees for task assignee picker
        if (all === "true") {
            return prisma.employee.findMany({
                select: { id: true, name: true, email: true, department: true, role: true },
                orderBy: { name: "asc" },
            });
        }

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        // Dynamic Prisma Where Filter
        const where: Prisma.EmployeeWhereInput = {};

        if (department && department !== "ALL") {
            where.department = department as EmployeeDepartment;
        }

        if (search && typeof search === "string" && search.trim() !== "") {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        // Run query and total count in parallel
        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where,
                skip,
                take,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    department: true,
                    role: true,
                    status: true,
                    isSuperAdmin: true,
                    createdAt: true,
                    _count: { select: { tasks: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.employee.count({ where }),
        ]);

        return {
            employees,
            total,
            totalPages: Math.ceil(total / take) || 1,
            currentPage: Number(page),
        };
    }

    //Get Employee by ID with Assigned Tasks
    async getEmployeeById(id: string) {

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                tasks: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!employee) {
            throw new AppError("Employee not found", 404);
        }

        const { password, ...safeEmployee } = employee;
        return safeEmployee;
    }

    //Create Employee
    async createEmployee(data: CreateEmployeeDTO) {
        const { name, email, department, role, status, password = "Welcome@123" } = data;

        if (!name || !email) {
            throw new AppError("Name and email are required", 400);
        }

        const existing = await prisma.employee.findUnique({ where: { email } });
        if (existing) {
            throw new AppError("An employee with this email already exists", 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                password: hashedPassword,
                department: department || EmployeeDepartment.Engineering,
                role: role || EmployeeRole.Employee,
                status: status || EmployeeStatus.Active,
                isSuperAdmin: false,
            },
        });

        const { password: _, ...safeEmployee } = employee;
        return safeEmployee;
    }

    //Update Employee
    async updateEmployee(id: string, data: UpdateEmployeeDTO) {
        const { name, email, department, role, status, isSuperAdmin } = data;

        // Check if employee exists
        const existing = await prisma.employee.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError("Employee not found", 404);
        }

        const updated = await prisma.employee.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(department && { department }),
                ...(role && { role }),
                ...(status && { status }),
                ...(isSuperAdmin !== undefined && { isSuperAdmin: Boolean(isSuperAdmin) }),
            },
        });

        const { password: _, ...safeEmployee } = updated;
        return safeEmployee;
    }

    //Delete Employee
    async deleteEmployee(id: string) {

        const existing = await prisma.employee.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError("Employee not found", 404);
        }

        await prisma.employee.delete({ where: { id } });
    }
}

export default new EmployeeService();
