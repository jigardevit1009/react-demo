import rabbitMQ from "../../config/rabbitmq";
import { ReportJobPayload } from "./report.types";

export const REPORT_QUEUE = "productivity_report_queue";

export class ReportService {
    async queueReportExport(userId: string): Promise<{ jobId: string; status: string; message: string }> {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const payload: ReportJobPayload = {
            jobId,
            userId,
            reportType: "FULL_ANALYTICS_CSV",
            requestedAt: new Date().toISOString(),
        };

        // Push job to RabbitMQ queue
        await rabbitMQ.publishToQueue(REPORT_QUEUE, payload);
        console.log(`[Producer] Job ${jobId} published to RabbitMQ queue`);

        return {
            jobId,
            status: "QUEUED",
            message: "Your report request is queued and processing in the background.",
        };
    }
}

export default new ReportService();
