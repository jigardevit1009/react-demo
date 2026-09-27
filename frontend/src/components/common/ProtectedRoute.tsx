import { Navigate, Outlet, useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { useAppSelector } from "../../store/store";

/**
 * ProtectedRoute Component
 * Guards private routes by checking Redux `isAuthenticated` state.
 * Redirects unauthenticated visitors to `/login` while preserving their intended location.
 */
function ProtectedRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default ProtectedRoute;
