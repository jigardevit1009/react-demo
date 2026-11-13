import { useCallback } from "react";
import {
  useExportReportMutation,
  ExportReportParams,
} from "../store/api/reportApiSlice";
import { useSocket } from "../context/SocketContext";
import { getErrorMessage } from "../utils/error";

interface ExportOptions {
  params?: ExportReportParams;
  queuedTitle: string;
  queuedMessage: string;
  failureMessage: string;
}

/** Queues a background report export and shows toast notifications. */
export function useExportReport() {
  const [exportReport, { isLoading: isExporting }] = useExportReportMutation();
  const { showNotification } = useSocket();

  const runExport = useCallback(
    async ({ params, queuedTitle, queuedMessage, failureMessage }: ExportOptions) => {
      try {
        showNotification({ title: queuedTitle, message: queuedMessage, type: "info" });
        await exportReport(params).unwrap();
      } catch (err: unknown) {
        console.error("Failed to queue export job:", err);
        showNotification({
          title: "Export Failed",
          message: getErrorMessage(err, failureMessage),
          type: "warning",
        });
      }
    },
    [exportReport, showNotification],
  );

  return { runExport, isExporting };
}
