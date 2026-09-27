import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/store";

/**
 * AdminRoute Component
 * Restricts access to Administrator-only routes (e.g., Employee Module).
 * Redirects non-admin users to `/dashboard`.
 */
function AdminRoute() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = Boolean(user?.isSuperAdmin);
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
