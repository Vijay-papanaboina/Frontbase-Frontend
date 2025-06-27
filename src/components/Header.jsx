import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Menu, Github } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { NavLink, navItems } from "./Sidebar";
import Logo from "./Logo";
import { ModeToggle } from "./ui/ModeToggle";

const Header = ({ isAuthenticated, user, handleLogout }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 lg:h-[60px] lg:px-6">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 bg-transparent border-border hover:bg-background/50 hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col bg-background border-r-border"
            >
              <nav className="grid gap-2 text-lg font-medium">
                <div className="mb-4">
                  <Logo />
                </div>
                {isAuthenticated &&
                  navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      {...item}
                      isActive={location.pathname === item.href}
                      onClick={() => setIsSheetOpen(false)}
                    />
                  ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:block">
          <Logo />
        </div>
      </div>
      <div className="w-full flex-1">{/* Can add search bar here later */}</div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-transparent border border-border"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.login} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {" "}
                    {user?.github_handle?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background border-border text-foreground"
            >
              <DropdownMenuLabel className="text-muted-foreground">
                {user?.github_handle}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="cursor-pointer hover:!bg-background/50"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="cursor-pointer text-destructive hover:!bg-destructive/10 hover:!text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            className="bg-background text-foreground hover:bg-background/50"
          >
            <Link to="/login">
              <Github className="mr-2 h-5 w-5" />
              Login with GitHub
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
