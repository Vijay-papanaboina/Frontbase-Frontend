import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Home as HomeIcon, ChevronsLeft } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/", icon: HomeIcon, label: "Home" },
];

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 font-semibold">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-blue-400"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400">
      Frontbase
    </span>
  </Link>
);

const NavLink = ({ href, icon, label, isActive, isCollapsed, onClick }) => {
  const Icon = icon;
  const linkContent = (
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
        isActive
          ? "bg-blue-500/10 text-blue-400"
          : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
      } ${isCollapsed ? "justify-center" : ""}`}
    >
      <Icon className="h-5 w-5" />
      <span
        className={`transition-opacity duration-200 ${
          isCollapsed ? "w-0 opacity-0" : "opacity-100"
        }`}
      >
        {!isCollapsed && label}
      </span>
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-gray-800 border-gray-700 text-white"
          >
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
};

const Sidebar = ({ isAuthenticated, isCollapsed, onToggle }) => {
  const location = useLocation();

  return (
    <div
      className={`hidden md:flex flex-col border-r border-gray-800 bg-gray-900/80 backdrop-blur-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[72px]" : "w-[220px] lg:w-[280px]"
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
          {isAuthenticated &&
            navItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                isActive={location.pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-gray-800 p-4">
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full justify-center bg-transparent text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
        >
          <ChevronsLeft
            className={`h-5 w-5 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : "rotate-0"
            }`}
          />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
export { Logo, NavLink, navItems };
