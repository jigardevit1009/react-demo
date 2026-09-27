export interface ReportJobPayload {
    jobId: string;
    userId: string;
    reportType: "TASKS_CSV" | "FULL_ANALYTICS_CSV" | string;
    isAdmin?: boolean;
    requestedAt: string;
}

export interface ReportJobResult {
    jobId: string;
    status: "COMPLETED" | "FAILED";
    totalTasks: number;
    totalEmployees?: number;
    generatedAt: string;
    downloadUrl: string;
    filename?: string;
}
