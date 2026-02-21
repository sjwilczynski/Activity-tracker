import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { Outlet, redirect, useNavigate } from "react-router";
import { AuthContext, type User } from "../../auth/AuthContext";
import { authService } from "../../auth/authService";
import { AppSidebar } from "../../components/navigation/AppSidebar";
import { MobileHeader } from "../../components/navigation/MobileHeader";
import { StylesProvider } from "../../components/styles/StylesProvider";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { Toaster } from "../../components/ui/sonner";
import { preferencesQueryOptions } from "../../data/queryOptions";
import { PagesContainer } from "../../pages/PagesContainer";
import { getLoadContext } from "../root";

export async function clientLoader() {
  const { queryClient, getAuthToken, authService } = getLoadContext();
  await authService.waitForAuth();

  if (!authService.isSignedIn()) {
    const returnTo = window.location.pathname;
    throw redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  // Pre-fetch preferences so StylesProvider has theme data immediately
  queryClient.ensureQueryData(preferencesQueryOptions(getAuthToken));

  return null;
}

function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(authService.getUser());

  useEffect(() => {
    return authService.onAuthStateChanged((newUser) => {
      setUser(newUser);
      // If user signs out, redirect to login
      if (!newUser) {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  const authContextValue = {
    signOut: () => authService.signOut(),
    getIdToken: user ? () => authService.getIdToken() : undefined,
    user: user ?? undefined,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default function Layout() {
  const { queryClient } = getLoadContext();

  // If we get here, user is authenticated (loader redirects otherwise)
  return (
    <QueryClientProvider client={queryClient}>
      <StylesProvider>
        <AuthStateProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-transparent">
              <MobileHeader />
              <PagesContainer>
                <Outlet />
              </PagesContainer>
            </SidebarInset>
          </SidebarProvider>
        </AuthStateProvider>
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </StylesProvider>
    </QueryClientProvider>
  );
}
