import { useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getRouteApi, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { AppSidebar } from "../components/navigation/AppSidebar";
import { MobileHeader } from "../components/navigation/MobileHeader";
import { Loading } from "../components/states/Loading";
import { StylesProvider } from "../components/styles/StylesProvider";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { Toaster } from "../components/ui/sonner";
import { PagesContainer } from "../pages/PagesContainer";

export function AuthenticatedShell() {
  const { preferencesQuery } = getRouteApi("/_authenticated").useRouteContext();
  const preferences = useQuery(preferencesQuery);
  return (
    <StylesProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <MobileHeader />
          <PagesContainer>
            {preferences.isError && (
              <div role="alert" className="mb-4 text-sm text-destructive">
                Preferences could not be loaded.{" "}
                <button
                  className="underline"
                  onClick={() => void preferences.refetch()}
                >
                  Try again
                </button>
              </div>
            )}
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </PagesContainer>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </StylesProvider>
  );
}
