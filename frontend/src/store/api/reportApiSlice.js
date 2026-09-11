import { apiSlice } from "./apiSlice";

export const reportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Trigger asynchronous RabbitMQ report generation
    exportReport: builder.mutation({
      query: () => ({
        url: "/reports/export",
        method: "POST",
      }),
      transformResponse: (response) => response.data || response,
    }),
  }),
});

export const { useExportReportMutation } = reportApiSlice;
