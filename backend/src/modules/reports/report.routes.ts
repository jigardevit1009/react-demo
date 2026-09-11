import { Router } from "express";
import reportController from "./report.controller";
import { authenticateJWT } from "../../middleware/authMiddleware";

const router = Router();

router.post("/export", authenticateJWT, reportController.requestExport);
router.get("/download/:jobId", reportController.downloadReport);

export default router;
