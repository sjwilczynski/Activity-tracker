import { useEffect } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { authService } from "../../auth/authService";
import { Login as LoginComponent } from "../../auth/Login";
import { RouteErrorBoundary, StylesProvider } from "../../components";
import { getLoadContext } from "../root";

export { RouteErrorBoundary as ErrorBoundary };

export async function clientLoader() {
  const { authService } = getLoadContext();
  await authService.waitForAuth();

  // If already signed in, redirect to welcome (or returnTo)
  if (authService.isSignedIn()) {
    const url = new URL(window.location.href);
    const returnTo = url.searchParams.get("returnTo") || "/welcome";
    throw redirect(returnTo);
  }

  return null;
}

export default function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/welcome";

  // Listen for auth state changes to redirect after login
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        navigate(returnTo, { replace: true });
      }
    });
    return unsubscribe;
  }, [navigate, returnTo]);

  return (
    <StylesProvider>
      <LoginComponent />
    </StylesProvider>
  );
}
