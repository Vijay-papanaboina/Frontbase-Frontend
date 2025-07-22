import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "@/store/auth";
import { Loader } from "lucide-react";

/**
 * PublicRoute component prevents authenticated users from accessing public routes
 * like login, register, etc. If authenticated, redirects to dashboard.
 */
const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard or previous location
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  // If not authenticated, render the public route
  return <Outlet />;
};

export default PublicRoute;
