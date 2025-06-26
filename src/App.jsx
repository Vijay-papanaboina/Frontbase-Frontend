import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Callback from "./pages/Callback";
import ProtectedRoute from "./pages/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import { useEffect } from "react";
import useAuthStore from "./lib/store";
import DeploymentDetails from "./pages/DeploymentDetails";
import DeploymentsPage from "./pages/DeploymentsPage";

function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="callback" element={<Callback />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/deployments/:id" element={<DeploymentDetails />} />
        <Route path="/deployments" element={<DeploymentsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
