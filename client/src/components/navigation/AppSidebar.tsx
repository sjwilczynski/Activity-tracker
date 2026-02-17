import {
  BarChart3,
  Home,
  ListChecks,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { useAuthContext } from "../../auth/AuthContext";
import { useThemeToggleWithTransition } from "../styles/StylesProvider";
import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar";

const primaryGradient = {
  background: "linear-gradient(135deg, #5085BE, #4272A8)",
} as const;

const navItems = [
  { title: "Dashboard", path: "/welcome", icon: Home },
  { title: "Charts", path: "/charts", icon: BarChart3 },
  { title: "Activity List", path: "/activity-list", icon: ListChecks },
  { title: "Settings", path: "/settings", icon: Settings },
] as const;

function getPageTitle(pathname: string) {
  const item = navItems.find((item) => item.path === pathname);
  return item?.title ?? "Activity Tracker";
}

export { getPageTitle };

export function AppSidebar() {
  const { user, signOut } = useAuthContext();
  const [isLightTheme, toggleTheme] = useThemeToggleWithTransition();
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Sidebar className="font-sans">
      <SidebarHeader className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-2xl text-white"
              style={primaryGradient}
            >
              <BarChart3 className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Activity Tracker
              </h2>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                Track your progress
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleTheme()}
            aria-label="Toggle theme"
            className="size-8"
          >
            {isLightTheme ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 pt-8">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.title}
                to={{ pathname: item.path, search: location.search }}
                viewTransition
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_2px_12px_rgba(80,133,190,0.35)]"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-6 pt-4">
        <div className="border-t border-sidebar-border pt-4">
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={primaryGradient}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.displayName ?? "User"}
              </p>
              <p className="text-[11px] text-muted-foreground">Active user</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => signOut?.()}
          >
            <LogOut className="mr-2 size-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
