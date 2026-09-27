import { Router } from "express";
import taskController from "./task.controller";
import { authenticateJWT } from "../../middleware/authMiddleware";

const router = Router();

// All task routes require authentication
router.use(authenticateJWT);

router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTaskById);
router.post("/", taskController.createTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
