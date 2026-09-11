import { Priority, TaskStatus } from "@prisma/client";

export interface CreateTaskDTO {
    title: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    dueDate?: string;
    assignedTo?: string | null;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    dueDate?: string;
    assignedTo?: string | null;
}

export interface GetTasksQueryDTO {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    priority?: string;
}

export interface PaginatedTasksResult {
    tasks: any[];
    total: number;
    totalPages: number;
    currentPage: number;
}
