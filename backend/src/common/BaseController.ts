import { Response } from "express";
import { error } from "node:console";

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
    error: string | null;
}

export abstract class BaseController {

    protected sendSuccess<T>(
        res: Response,
        message: string,
        data: T | null = null,
        statusCode: number = 200
    ): Response<ApiResponse<T>> {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            error: null
        });
    }

    protected sendError(
        res: Response,
        message: string,
        error: any = null,
        statusCode: number = 500
    ): Response<ApiResponse<null>> {
        const errorMessage =
            error instanceof Error
                ? error.message
                : typeof error === "string"
                    ? error
                    : "Internal Server Error";
        return res.status(statusCode).json({
            success: false,
            message,
            data: null,
            error: errorMessage,
        });
    }
}

