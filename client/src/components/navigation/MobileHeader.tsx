import { useLocation } from "react-router";
import { SidebarTrigger } from "../ui/sidebar";
import { getPageTitle } from "./AppSidebar";

export function MobileHeader() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-sm md:hidden">
      <SidebarTrigger />
      <h1 className="text-sm font-semibold">{title}</h1>
    </header>
  );
}
