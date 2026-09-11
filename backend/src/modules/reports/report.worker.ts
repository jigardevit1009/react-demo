import rabbitMQ from "../../config/rabbitmq";
import prisma from "../../config/prisma";
import { emitToUser } from "../../config/socket";
import { REPORT_QUEUE } from "./report.service";
import { ReportJobPayload } from "./report.types";

export const startReportWorker = async () => {
    try {
        await rabbitMQ.consumeQueue(
            REPORT_QUEUE,
            async (jobData: ReportJobPayload, ack, nack) => {
                console.log(`[Worker] Processing Job ID: ${jobData.jobId} for user: ${jobData.userId}`);

                try {
                    // Fetch data from Supabase using Prisma
                    const [employeeCount, taskCount] = await Promise.all([
                        prisma.employee.count(),
                        prisma.task.count(),
                    ]);

                    // Simulate heavy compilation (2.5 seconds off the main thread)
                    await new Promise((resolve) => setTimeout(resolve, 2500));

                    const result = {
                        jobId: jobData.jobId,
                        status: "COMPLETED",
                        totalEmployees: employeeCount,
                        totalTasks: taskCount,
                        generatedAt: new Date().toISOString(),
                        downloadUrl: `/api/reports/download/${jobData.jobId}`,
                    };

                    // Notify user in real-time via Socket.IO
                    emitToUser(jobData.userId, "notification:report_ready", {
                        title: "Report Generated!",
                        message: `Your Analytics Report with ${employeeCount} employees & ${taskCount} tasks is ready to download.`,
                        data: result,
                    });

                    // Acknowledge message to remove from RabbitMQ queue
                    ack();
                    console.log(`[Worker] Job ${jobData.jobId} completed & ACK sent!`);
                } catch (err) {
                    console.error(`[Worker] Error processing job ${jobData.jobId}:`, err);
                    nack(); // Requeue on error
                }
            }
        );
    } catch (error: any) {
        console.warn("[Worker] Report consumer will retry when RabbitMQ connects:", error.message);
    }
};
