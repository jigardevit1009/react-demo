import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../common/BaseController";
import reportService, { ReportService } from "./report.service";
import prisma from "../../config/prisma";

function escapeCsv(val: unknown): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
}

export class ReportController extends BaseController {
    private service: ReportService;

    constructor() {
        super();
        this.service = reportService;
    }

    // Trigger Async Report Export via RabbitMQ AMQP
    requestExport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id || "guest_user";
            const isAdmin = Boolean(req.user?.isSuperAdmin);
            const reportType = req.body?.reportType || "TASKS_CSV";
            const result = await this.service.queueReportExport(userId, reportType, isAdmin);
            return this.sendSuccess(res, result.message, result, 202); // 202 Accepted
        } catch (error) {
            next(error);
        }
    };

    // Download Endpoint for Generated Tasks CSV
    downloadReport = async (req: Request, res: Response) => {
        const jobId = String(req.params.jobId);
        const stored = this.service.getGeneratedReport(jobId);

        if (stored) {
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="${stored.filename}"`);
            return res.send(stored.csv);
        }

        // Direct fallback: Fetch and stream tasks as CSV if cache expired or on-demand
        try {
            const tasks = await prisma.task.findMany({
                include: { employee: true },
                orderBy: { createdAt: "desc" },
            });

            const headers = [
                "Task ID",
                "Title",
                "Description",
                "Status",
                "Priority",
                "Due Date",
                "Assigned Employee",
                "Employee Email",
                "Created At"
            ];

            const rows = tasks.map((t) => [
                escapeCsv(t.id),
                escapeCsv(t.title),
                escapeCsv(t.description || "N/A"),
                escapeCsv(t.status),
                escapeCsv(t.priority),
                escapeCsv(t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "No deadline"),
                escapeCsv(t.employee?.name || "Unassigned"),
                escapeCsv(t.employee?.email || "N/A"),
                escapeCsv(new Date(t.createdAt).toISOString()),
            ].join(","));

            const csvContent = [headers.join(","), ...rows].join("\r\n");
            const filename = `tasks-report-${new Date().toISOString().split("T")[0]}-${jobId.slice(-6)}.csv`;

            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            return res.send(csvContent);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to download task report.",
            });
        }
    };
}

export default new ReportController();
