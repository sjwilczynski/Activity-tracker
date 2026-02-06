import { useEffect } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { authService } from "../../auth/authService";
import { Login as LoginComponent } from "../../auth/Login";
import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import { StylesProvider } from "../../components/styles/StylesProvider";
import { getLoadContext } from "../root";

export { RouteErrorBoundary as ErrorBoundary };

function getSafeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/welcome";
  }
  return value;
}

export async function clientLoader() {
  const { authService } = getLoadContext();
  await authService.waitForAuth();

  // If already signed in, redirect to welcome (or returnTo)
  if (authService.isSignedIn()) {
    const url = new URL(window.location.href);
    const returnTo = getSafeReturnTo(url.searchParams.get("returnTo"));
    throw redirect(returnTo);
  }

  return null;
}

export default function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"));

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
