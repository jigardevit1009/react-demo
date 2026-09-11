import prisma from "../../config/prisma";
import { AppError } from "../../common/AppError";
import {
    CreateTaskDTO,
    UpdateTaskDTO,
    GetTasksQueryDTO,
    PaginatedTasksResult,
} from "./task.types";
import { Priority, TaskStatus, Prisma } from "@prisma/client";
import { emitToAll, emitToUser } from "../../config/socket";

export class TaskService {
    // Get Paginated & Filtered Tasks
    async getTasks(query: GetTasksQueryDTO): Promise<PaginatedTasksResult> {
        const { page = "1", limit = "10", search, status, priority } = query;

        // Safe numerical pagination (avoids NaN)
        const take = Number(limit) || 10;
        const pageNum = Math.max(1, Number(page) || 1);
        const skip = (pageNum - 1) * take;

        // Dynamic Prisma Where Filter
        const where: Prisma.TaskWhereInput = {};

        // Normalize Status (e.g. "In Progress" -> "IN_PROGRESS", "Completed" -> "COMPLETED")
        if (status && status !== "ALL") {
            const normalizedStatus = status.toUpperCase().replace(/\s+/g, "_");
            if (normalizedStatus in TaskStatus) {
                where.status = normalizedStatus as TaskStatus;
            }
        }

        // Normalize Priority (e.g. "High" -> "HIGH", "medium" -> "MEDIUM")
        if (priority && priority !== "ALL") {
            const normalizedPriority = priority.toUpperCase();
            if (normalizedPriority in Priority) {
                where.priority = normalizedPriority as Priority;
            }
        }

        if (search && typeof search === "string" && search.trim() !== "") {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        // Run query & total count in parallel
        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take,
                include: {
                    employee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            department: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.task.count({ where }),
        ]);

        return {
            tasks,
            total,
            totalPages: Math.ceil(total / take) || 1,
            currentPage: pageNum,
        };
    }

    // Get Single Task by ID
    async getTaskById(id: string) {
        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        role: true,
                    },
                },
            },
        });

        if (!task) {
            throw new AppError("Task not found", 404);
        }

        return task;
    }

    // Create Task
    async createTask(data: CreateTaskDTO) {
        const { title, description, priority, status, dueDate, assignedTo } = data;

        if (!title) {
            throw new AppError("Task title is required", 400);
        }

        if (assignedTo) {
            const employeeExists = await prisma.employee.findUnique({
                where: { id: assignedTo },
            });
            if (!employeeExists) {
                throw new AppError("Assigned employee does not exist", 400);
            }
        }

        // Normalize Enums
        const normPriority = priority
            ? (priority.toUpperCase() as Priority)
            : Priority.MEDIUM;
        const normStatus = status
            ? (status.toUpperCase().replace(/\s+/g, "_") as TaskStatus)
            : TaskStatus.PENDING;

        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                priority: normPriority,
                status: normStatus,
                dueDate: dueDate ? new Date(dueDate) : null,
                assignedTo: assignedTo || null,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        role: true,
                    },
                },
            },
        });

        // Real-time broadcasts via Socket.IO
        emitToAll("task:created", task);
        if (task.assignedTo) {
            emitToUser(task.assignedTo, "notification:new_task", {
                title: "New Task Assigned!",
                message: `You have been assigned: "${task.title}"`,
                task,
            });
        }

        return task;
    }

    // Update Task
    async updateTask(id: string, data: UpdateTaskDTO) {
        const { title, description, priority, status, dueDate, assignedTo } = data;

        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError("Task not found", 404);
        }

        if (assignedTo) {
            const employeeExists = await prisma.employee.findUnique({
                where: { id: assignedTo },
            });
            if (!employeeExists) {
                throw new AppError("Assigned employee does not exist", 400);
            }
        }

        // Normalize Enums
        const normPriority = priority
            ? (priority.toUpperCase() as Priority)
            : undefined;
        const normStatus = status
            ? (status.toUpperCase().replace(/\s+/g, "_") as TaskStatus)
            : undefined;

        const updated = await prisma.task.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(normPriority && { priority: normPriority }),
                ...(normStatus && { status: normStatus }),
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
                ...(assignedTo !== undefined && { assignedTo: assignedTo || null }),
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        role: true,
                    },
                },
            },
        });

        emitToAll("task:updated", updated);
        if (updated.assignedTo) {
            emitToUser(updated.assignedTo, "notification:task_updated", {
                title: "Task Updated",
                message: `Task "${updated.title}" status changed to ${updated.status}`,
                task: updated,
            });
        }

        return updated;
    }

    // Delete Task
    async deleteTask(id: string) {
        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError("Task not found", 404);
        }

        await prisma.task.delete({ where: { id } });
        emitToAll("task:deleted", { id });
    }
}

export default new TaskService();
