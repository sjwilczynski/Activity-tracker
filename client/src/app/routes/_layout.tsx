import { styled } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { useEffect, useState } from "react";
import { Outlet, redirect, useNavigate } from "react-router";
import { AuthContext, type User } from "../../auth/AuthContext";
import { authService } from "../../auth/authService";
import { AppBar } from "../../components/appContainer/AppBar";
import { Navigation } from "../../components/navigation/Navigation";
import { StylesProvider } from "../../components/styles/StylesProvider";
import { PagesContainer } from "../../pages/PagesContainer";
import { getLoadContext } from "../root";

const Container = styled("div")(({ theme }) => ({
  height: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(200px, 17rem) 1fr",
  gridTemplateRows: "auto 1fr",
  gridTemplateAreas: `"navigation header"
                      "navigation content"`,
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
    gridTemplateRows: "minmax(min-content, auto) 1fr",
    gridTemplateAreas: `"header"
                        "content"`,
  },
}));

export async function clientLoader() {
  const { authService } = getLoadContext();
  await authService.waitForAuth();

  if (!authService.isSignedIn()) {
    const returnTo = window.location.pathname;
    throw redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

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
      <Provider>
        <StylesProvider>
          <AuthStateProvider>
            <Container>
              <Navigation />
              <AppBar />
              <PagesContainer>
                <Outlet />
              </PagesContainer>
            </Container>
          </AuthStateProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </StylesProvider>
      </Provider>
    </QueryClientProvider>
  );
}
