// backend/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../common/BaseController.js";
import authService, { AuthService } from "./auth.service.js";

export class AuthController extends BaseController {
    private service: AuthService;

    constructor() {
        super();
        this.service = authService;
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.register(req.body);
            return this.sendSuccess(res, "Account created successfully", result, 201);
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.login(req.body);
            return this.sendSuccess(res, "Login successful", result);
        } catch (error) {
            next(error);
        }
    };

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profile = await this.service.getProfile(req.user!.id);
            return this.sendSuccess(res, "Profile fetched successfully", profile);
        } catch (error) {
            next(error);
        }
    };

    forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.service.resetPassword(req.body);
            return this.sendSuccess(res, "Password reset successfully");
        } catch (error) {
            next(error);
        }
    };
}

export default new AuthController();
