import { Router } from "express";
import reportController from "./report.controller";
import { authenticateJWT } from "../../middleware/authMiddleware";

const router = Router();

// Authenticated users can trigger background AMQP task export jobs
router.post("/export", authenticateJWT, reportController.requestExport);
router.get("/download/:jobId", reportController.downloadReport);

export default router;
