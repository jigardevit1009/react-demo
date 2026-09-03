// backend/src/modules/auth/auth.routes.ts
import { Router } from "express";
import authController from "./auth.controller";
import { authenticateJWT } from "../../middleware/authMiddleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.get("/me", authenticateJWT, authController.getMe);

export default router;
