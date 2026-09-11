export interface ReportJobPayload {
    jobId: string;
    userId: string;
    reportType: string;
    requestedAt: string;
}

export interface ReportJobResult {
    jobId: string;
    status: "COMPLETED" | "FAILED";
    totalEmployees: number;
    totalTasks: number;
    generatedAt: string;
    downloadUrl: string;
}
