import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../common/BaseController";
import reportService, { ReportService } from "./report.service";

export class ReportController extends BaseController {
    private service: ReportService;

    constructor() {
        super();
        this.service = reportService;
    }

    // Trigger Async Report Export
    requestExport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id || "guest_user";
            const result = await this.service.queueReportExport(userId);
            return this.sendSuccess(res, result.message, result, 202); // 202 Accepted
        } catch (error) {
            next(error);
        }
    };

    // Mock Download Endpoint for Demo
    downloadReport = async (req: Request, res: Response) => {
        const { jobId } = req.params;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="productivity-report-${jobId}.csv"`);
        res.send(`Job ID,Status,Generated At\n${jobId},COMPLETED,${new Date().toISOString()}`);
    };
}

export default new ReportController();
