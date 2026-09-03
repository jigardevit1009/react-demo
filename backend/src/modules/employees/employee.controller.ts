import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../common/BaseController";
import employeeService, { EmployeeService } from "./employee.service";

export class EmployeeController extends BaseController {
    private service: EmployeeService;

    constructor() {
        super();
        this.service = employeeService;
    }

    getEmployees = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.getEmployees(req.query);
            return this.sendSuccess(res, "Employees fetched successfully", result);
        } catch (error) {
            next(error);
        }
    };

    getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const employee = await this.service.getEmployeeById(req.params.id as string);
            return this.sendSuccess(res, "Employee details fetched", employee);
        } catch (error) {
            next(error);
        }
    };

    createEmployee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const employee = await this.service.createEmployee(req.body);
            return this.sendSuccess(res, "Employee created successfully", employee, 201);
        } catch (error) {
            next(error);
        }
    };

    updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updated = await this.service.updateEmployee(req.params.id as string, req.body);
            return this.sendSuccess(res, "Employee updated successfully", updated);
        } catch (error) {
            next(error);
        }
    };

    deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.service.deleteEmployee(req.params.id as string);
            return this.sendSuccess(res, "Employee deleted successfully");
        } catch (error) {
            next(error);
        }
    };
}

export default new EmployeeController();
