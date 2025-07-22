import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import { useEffect } from "react";
import useAuthStore from "./store/auth";
import DeploymentDetails from "./pages/DeploymentDetails";
import DeploymentsPage from "./pages/DeploymentsPage";
import Callback from "./pages/callback";

function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="callback" element={<Callback />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="deployments" element={<DeploymentsPage />} />
          <Route path="deployments/:id" element={<DeploymentDetails />} />
        </Route>

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
              <p className="text-lg text-gray-600">
                The page you're looking for doesn't exist.
              </p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
