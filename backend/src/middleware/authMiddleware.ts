import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

export interface AuthUserPayload {
    id: string;
    email: string;
    name?: string;
    role?: string;
    isSuperAdmin: boolean;
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: AuthUserPayload;
        }
    }
}

// Verify Bearer JWT
export const authenticateJWT = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization token required",
            data: null,
            error: "Unauthorized",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "react_demo_2026"
        ) as AuthUserPayload;

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            data: null,
            error: "Unauthorized",
        });
    }
};

// Guard for SuperAdmin-Only routes
export const requireSuperAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user?.isSuperAdmin) {
        return res.status(403).json({
            success: false,
            message: "Access Denied: SuperAdmin permission required",
            data: null,
            error: "Forbidden",
        });
    }
    next();
};

// Guard for Admin-Only routes (Employees module, management operations)
export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let isAdmin = Boolean(req.user?.isSuperAdmin);
    if (!isAdmin && req.user?.id) {
        const emp = await prisma.employee.findUnique({
            where: { id: req.user.id },
            select: { isSuperAdmin: true },
        });
        if (emp?.isSuperAdmin) {
            isAdmin = true;
        }
    }

    if (!isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Access Denied: Administrator permission required to access Employee module",
            data: null,
            error: "Forbidden",
        });
    }
    next();
};
