import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/auth";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        handleLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isAuthenticated={isAuthenticated}
          isCollapsed={isCollapsed}
          onToggle={handleToggleSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
