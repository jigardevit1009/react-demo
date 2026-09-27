import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Prisma unique constraint violation
    if (err.code === "P2002") {
        statusCode = 400;
        message = "A record with this email already exists.";
    } else if (err.code === "P2025") {
        statusCode = 404;
        message = "Requested record was not found.";
    }

    if (process.env.NODE_ENV === "development") {
        console.error("Error caught by global handler:", err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        data: null,
        error: err.message || message,
    });
};
