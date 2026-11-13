import Button from "./Button";

/**
 * Loading / error / empty placeholders used inside tables and detail pages.
 */

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="text-center py-12 text-gray-500 space-y-2" role="status">
      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message?: string;
}

export function ErrorState({ title, message }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="text-center py-12 px-4 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 space-y-2"
    >
      <p className="font-semibold text-sm">{title}</p>
      {message && <p className="text-xs text-red-500 dark:text-red-400">{message}</p>}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {message && <p className="text-xs text-gray-400 mt-1">{message}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
