import { apiSlice } from "./apiSlice";

export interface ExportReportParams {
  reportType?: "TASKS_CSV" | "FULL_ANALYTICS_CSV" | string;
}

export interface ExportReportResult {
  jobId?: string;
  status?: string;
  message?: string;
  downloadUrl?: string;
}

export const reportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Queue a background report export (the user is notified via socket when it's ready)
    exportReport: builder.mutation<ExportReportResult, ExportReportParams | void>({
      query: (params) => ({
        url: "/reports/export",
        method: "POST",
        body: params || { reportType: "TASKS_CSV" },
      }),
      transformResponse: (response: { data?: ExportReportResult } | ExportReportResult) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as ExportReportResult;
      },
    }),
  }),
});

export const { useExportReportMutation } = reportApiSlice;
