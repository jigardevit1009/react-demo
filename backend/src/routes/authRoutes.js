import { Router } from "express";
import { login, register, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

// Public auth routes
router.post("/login", login);
router.post("/register", register);

// Protected auth route
router.get("/me", authenticateToken, getMe);

export default router;
