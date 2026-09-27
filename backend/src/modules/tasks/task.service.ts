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
import { AuthUserPayload } from "../../middleware/authMiddleware";

export class TaskService {
    // Helper to verify admin privileges (supports new JWT and legacy sessions)
    private async isUserAdmin(currentUser?: AuthUserPayload): Promise<boolean> {
        if (!currentUser) return false;
        if (currentUser.isSuperAdmin) {
            return true;
        }
        if (currentUser.id) {
            const emp = await prisma.employee.findUnique({
                where: { id: currentUser.id },
                select: { isSuperAdmin: true },
            });
            if (emp?.isSuperAdmin) {
                return true;
            }
        }
        return false;
    }

    // Get Paginated & Filtered Tasks
    async getTasks(query: GetTasksQueryDTO, currentUser?: AuthUserPayload): Promise<PaginatedTasksResult> {
        const { page = "1", limit = "10", search, status, priority, assignee, assignedTo, all } = query;
        const isAdmin = await this.isUserAdmin(currentUser);

        // Safe numerical pagination (avoids NaN)
        const isAll = all === "true" || all === true;
        const take = isAll ? 1000 : (Number(limit) || 10);
        const pageNum = isAll ? 1 : Math.max(1, Number(page) || 1);
        const skip = isAll ? 0 : (pageNum - 1) * take;

        // Dynamic Prisma Where Filter
        const where: Prisma.TaskWhereInput = {};

        // Role-Based Task Visibility:
        if (!isAdmin && currentUser?.id) {
            // Assigned Task Users (Employees) can ONLY view tasks assigned to them!
            where.assignedTo = currentUser.id;
        } else if (isAdmin) {
            // Admins can view all or filter by assignee
            const targetAssignee = assignee || assignedTo;
            if (targetAssignee && targetAssignee !== "ALL") {
                if (targetAssignee === "UNASSIGNED") {
                    where.assignedTo = null;
                } else {
                    where.assignedTo = targetAssignee;
                }
            }
        }

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
    async getTaskById(id: string, currentUser?: AuthUserPayload) {
        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!task) {
            throw new AppError("Task not found", 404);
        }

        const isAdmin = await this.isUserAdmin(currentUser);
        if (!isAdmin && currentUser?.id && task.assignedTo !== currentUser.id) {
            throw new AppError("Access denied: You can only view tasks assigned to you", 403);
        }

        return task;
    }

    // Create Task
    async createTask(data: CreateTaskDTO, currentUser?: AuthUserPayload) {
        const { title, description, priority, status, dueDate } = data;
        let { assignedTo } = data;

        if (!title) {
            throw new AppError("Task title is required", 400);
        }

        const isAdmin = await this.isUserAdmin(currentUser);
        if (!isAdmin && currentUser?.id) {
            // Non-admin can only create tasks assigned to themselves
            assignedTo = currentUser.id;
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
            : TaskStatus.TODO;

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
    async updateTask(id: string, data: UpdateTaskDTO, currentUser?: AuthUserPayload) {
        const { title, description, priority, status, dueDate } = data;
        let { assignedTo } = data;

        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError("Task not found", 404);
        }

        const isAdmin = await this.isUserAdmin(currentUser);
        if (!isAdmin && currentUser?.id) {
            if (existing.assignedTo !== currentUser.id) {
                throw new AppError("Access denied: You can only update tasks assigned to you", 403);
            }
            // Non-admin cannot reassign task to someone else
            assignedTo = existing.assignedTo;
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
    async deleteTask(id: string, currentUser?: AuthUserPayload) {
        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError("Task not found", 404);
        }

        const isAdmin = await this.isUserAdmin(currentUser);
        if (!isAdmin) {
            throw new AppError("Access denied: Only administrators can delete tasks", 403);
        }

        await prisma.task.delete({ where: { id } });
        emitToAll("task:deleted", { id });
    }
}

export default new TaskService();
