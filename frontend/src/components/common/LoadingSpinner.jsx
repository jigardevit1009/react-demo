/**
 * LoadingSpinner Component
 * Rendered by <Suspense /> fallback while lazy-loaded JavaScript chunks are downloading
 */
function LoadingSpinner({ message = "Loading view..." }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-3 border-blue-200 dark:border-blue-900 animate-pulse" />
        <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin absolute inset-0" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {message}
        </p>
        <p className="text-xs text-gray-400">
          Downloading on-demand JavaScript chunk via React.lazy()
        </p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
