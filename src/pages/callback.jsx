import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import useAuthStore from "@/store/auth";

function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { isAuthenticated, loading } = useAuthStore();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          throw new Error(error);
        }

        if (!code) {
          throw new Error("No authorization code provided");
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/auth/github/callback?code=${code}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Authentication failed");
        }

        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Authentication error:", err);
        setError(err.message);
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    if (!isAuthenticated && !loading) {
      handleCallback();
    }
  }, [navigate, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <div className="text-sm text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader className="h-8 w-8 animate-spin mb-4" />
      <p className="text-muted-foreground">Finalizing login...</p>
    </div>
  );
}

export default Callback;
