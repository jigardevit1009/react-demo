import rabbitMQ from "../../config/rabbitmq";
import { ReportJobPayload } from "./report.types";

export const REPORT_QUEUE = "productivity_report_queue";

export interface StoredReport {
    csv: string;
    filename: string;
    generatedAt: string;
    userId: string;
}

export class ReportService {
    private reportsMap = new Map<string, StoredReport>();

    async queueReportExport(
        userId: string,
        reportType = "TASKS_CSV",
        isAdmin = false
    ): Promise<{ jobId: string; status: string; message: string }> {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const payload: ReportJobPayload = {
            jobId,
            userId,
            reportType,
            isAdmin,
            requestedAt: new Date().toISOString(),
        };

        // Push job to RabbitMQ queue via AMQP protocol
        await rabbitMQ.publishToQueue(REPORT_QUEUE, payload);
        console.log(`[RabbitMQ Producer] Task export job ${jobId} published to queue "${REPORT_QUEUE}" via AMQP`);

        return {
            jobId,
            status: "QUEUED",
            message: "Your task export job is queued in RabbitMQ and compiling in the background.",
        };
    }

    saveGeneratedReport(jobId: string, csv: string, filename: string, userId: string): void {
        this.reportsMap.set(jobId, {
            csv,
            filename,
            generatedAt: new Date().toISOString(),
            userId,
        });

        // Auto-cleanup after 2 hours
        setTimeout(() => {
            this.reportsMap.delete(jobId);
        }, 2 * 60 * 60 * 1000);
    }

    getGeneratedReport(jobId: string): StoredReport | undefined {
        return this.reportsMap.get(jobId);
    }
}

export default new ReportService();
