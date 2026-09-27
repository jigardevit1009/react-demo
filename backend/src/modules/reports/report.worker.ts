import rabbitMQ from "../../config/rabbitmq";
import prisma from "../../config/prisma";
import { emitToUser } from "../../config/socket";
import reportService, { REPORT_QUEUE } from "./report.service";
import { ReportJobPayload } from "./report.types";

function escapeCsv(val: unknown): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
}

export const startReportWorker = async () => {
    try {
        await rabbitMQ.consumeQueue(
            REPORT_QUEUE,
            async (jobData: ReportJobPayload, ack, nack) => {
                console.log(`[RabbitMQ Worker] AMQP message received. Processing Job ID: ${jobData.jobId} for user: ${jobData.userId}`);

                try {
                    // Filter tasks if not superadmin and a valid user ID is supplied
                    const whereClause = !jobData.isAdmin && jobData.userId !== "guest_user"
                        ? { assignedTo: jobData.userId }
                        : {};

                    const tasks = await prisma.task.findMany({
                        where: whereClause,
                        include: { employee: true },
                        orderBy: { createdAt: "desc" },
                    });

                    // Build real Tasks CSV formatted table
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
                    const dateTag = new Date().toISOString().split("T")[0];
                    const filename = `tasks-report-${dateTag}-${jobData.jobId.slice(-6)}.csv`;

                    // Cache generated CSV for download
                    reportService.saveGeneratedReport(jobData.jobId, csvContent, filename, jobData.userId);

                    const result = {
                        jobId: jobData.jobId,
                        status: "COMPLETED",
                        totalTasks: tasks.length,
                        generatedAt: new Date().toISOString(),
                        downloadUrl: `/api/reports/download/${jobData.jobId}`,
                        filename,
                    };

                    // Notify user in real-time via Socket.IO
                    emitToUser(jobData.userId, "notification:report_ready", {
                        title: "Tasks CSV Report Ready!",
                        message: `RabbitMQ AMQP worker compiled ${tasks.length} task records. Click below to download.`,
                        data: result,
                    });

                    // Acknowledge message to remove from RabbitMQ queue
                    ack();
                    console.log(`[RabbitMQ Worker] Job ${jobData.jobId} completed & AMQP ACK sent! (${tasks.length} tasks exported)`);
                } catch (err) {
                    console.error(`[RabbitMQ Worker] Error processing job ${jobData.jobId}:`, err);
                    nack(); // Requeue on error
                }
            }
        );
    } catch (error: any) {
        console.warn("[RabbitMQ Worker] Report consumer will retry when RabbitMQ connects:", error.message);
    }
};
