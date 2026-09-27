import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../common/BaseController";
import taskService, { TaskService } from "./task.service";

export class TaskController extends BaseController {
    private service: TaskService;

    constructor() {
        super();
        this.service = taskService;
    }

    getTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.getTasks(req.query, req.user);
            return this.sendSuccess(res, "Tasks fetched successfully", result);
        } catch (error) {
            next(error);
        }
    };

    getTaskById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const task = await this.service.getTaskById(req.params.id as string, req.user);
            return this.sendSuccess(res, "Task details fetched", task);
        } catch (error) {
            next(error);
        }
    };

    createTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const task = await this.service.createTask(req.body, req.user);
            return this.sendSuccess(res, "Task created successfully", task, 201);
        } catch (error) {
            next(error);
        }
    };

    updateTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updated = await this.service.updateTask(req.params.id as string, req.body, req.user);
            return this.sendSuccess(res, "Task updated successfully", updated);
        } catch (error) {
            next(error);
        }
    };

    deleteTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.service.deleteTask(req.params.id as string, req.user);
            return this.sendSuccess(res, "Task deleted successfully");
        } catch (error) {
            next(error);
        }
    };
}

export default new TaskController();
