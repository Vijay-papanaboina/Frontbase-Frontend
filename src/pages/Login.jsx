import { Button } from "@/components/ui/button";
import { Github, Loader } from "lucide-react";
import useAuthStore from "@/store/auth";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { isAuthenticated, loading } = useAuthStore();

  const handleLogin = () => {
    console.log("[FRONTEND] Login button clicked");
    window.location.href = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/auth/github`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="relative flex items-center justify-center h-screen -mt-14">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] -z-10"></div>
      <div className="w-full max-w-md p-8 space-y-8 bg-card border border-border rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Frontbase
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in with GitHub to deploy your projects.
          </p>
        </div>
        <Button
          onClick={handleLogin}
          size="lg"
          className="w-full bg-card text-card-foreground hover:bg-muted transition-all duration-300 hover:scale-105 hover:cursor-pointer"
        >
          <Github className="mr-2 h-5 w-5" />
          Login with GitHub
        </Button>
      </div>
    </div>
  );
};

export default Login;
