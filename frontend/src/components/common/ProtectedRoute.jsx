import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

/**
 * ProtectedRoute Component
 * Guards private routes by checking Redux `isAuthenticated` state.
 * Redirects unauthenticated visitors to `/login` while preserving their intended location.
 */
function ProtectedRoute() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // If user is not authenticated, redirect to /login and remember where they came from
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render matched child route inside MainLayout
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default ProtectedRoute;
