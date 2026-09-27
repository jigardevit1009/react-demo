import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
      <div className="text-center max-w-md bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm text-gray-900 dark:text-white">
        <span className="text-5xl font-extrabold text-blue-600 dark:text-blue-500">404</span>
        <h1 className="text-xl font-bold mt-3">Page Not Found</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
          The route you are trying to access does not exist in our React Router configuration.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
