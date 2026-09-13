import { Router } from "express";
import reportController from "./report.controller";
import { authenticateJWT, requireAdmin } from "../../middleware/authMiddleware";

const router = Router();

// Only administrators can trigger company-wide background export jobs
router.post("/export", authenticateJWT, requireAdmin, reportController.requestExport);
router.get("/download/:jobId", reportController.downloadReport);

export default router;
