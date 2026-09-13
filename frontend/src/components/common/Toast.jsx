import { useEffect } from "react";
import { Bell, CheckCircle2, Download, X, AlertCircle } from "lucide-react";

function Toast({ notification, onDismiss }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const { title, message, type = "info", downloadUrl } = notification;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case "report":
        return <Download className="w-5 h-5 text-blue-500 shrink-0 animate-bounce" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500 shrink-0 animate-pulse" />;
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const fullUrl = downloadUrl.startsWith("http")
        ? downloadUrl
        : `http://localhost:5000${downloadUrl}`;
      window.open(fullUrl, "_blank");
    }
    onDismiss();
  };

  return (
    <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2.5rem)] sm:w-full animate-in fade-in slide-in-from-top-5 duration-300 pointer-events-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-3 backdrop-blur-lg">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/80">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {title || "Real-Time Notification"}
            </h4>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
              Live Socket
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
            {message}
          </p>

          {downloadUrl && (
            <button
              onClick={handleDownload}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report (.CSV)
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
