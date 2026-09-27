import { Router } from "express";
import employeeController from "./employee.controller";
import { authenticateJWT, requireAdmin, requireSuperAdmin } from "../../middleware/authMiddleware";

const router = Router();

// All employee routes require authentication and Administrator permissions
router.use(authenticateJWT);
router.use(requireAdmin);

router.get("/", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", employeeController.createEmployee);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", requireSuperAdmin, employeeController.deleteEmployee); // Only SuperAdmin can delete!

export default router;
