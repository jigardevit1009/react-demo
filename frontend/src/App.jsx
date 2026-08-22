import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Route-Based Code Splitting: Lazy load each page on demand
const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const DashboardPage = lazy(() => import("./pages/Dashboard/DashboardPage"));
const EmployeesPage = lazy(() => import("./pages/Employees/EmployeesPage"));
const EmployeeDetailPage = lazy(
  () => import("./pages/Employees/EmployeeDetailPage"),
);
const TasksPage = lazy(() => import("./pages/Tasks/TasksPage"));
const TaskDetailPage = lazy(() => import("./pages/Tasks/TaskDetailPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner message="Initializing workspace..." />}>
      <Routes>
        {/* 1. Public Route: Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Protected Routes (Wrapped inside <ProtectedRoute /> and <MainLayout />) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Lazy-Loaded Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Lazy-Loaded Employees */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />

          {/* Lazy-Loaded Tasks */}
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
        </Route>

        {/* 3. 404 Catch-All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
