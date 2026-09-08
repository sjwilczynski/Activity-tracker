import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import {
  Link,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { safeReturnTo } from "../../app/search";
import { Button } from "../ui/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center p-8">
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist
      </p>
      <Button variant="gradient" asChild>
        <Link to="/welcome">Go Home</Link>
      </Button>
    </div>
  );
}

export function RouteErrorBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { reset } = useQueryErrorResetBoundary();
  useEffect(() => {
    reset();
  }, [reset]);
  const status = (error as Error & { status?: number }).status;
  const reauthenticate = async () => {
    setSigningOut(true);
    setSignOutError(null);
    const returnTo = safeReturnTo(router.state.location.href);
    const history = router.history;
    try {
      await router.options.context.authService.signOut();
      // The session host now owns a new router on the same browser history.
      history.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    } catch (failure) {
      setSignOutError(
        failure instanceof Error
          ? failure.message
          : "Could not sign out. Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  };
  if (status === 401 || status === 403) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center p-8"
      >
        <h2 className="text-2xl font-bold">Session Expired</h2>
        <p className="text-muted-foreground">
          Please sign in again to continue
        </p>
        <Button
          variant="gradient"
          disabled={signingOut}
          onClick={() => void reauthenticate()}
        >
          Sign In
        </Button>
        {signOutError && <p>{signOutError}</p>}
      </div>
    );
  }
  if (status === 404) return <NotFound />;
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center p-8"
    >
      <h2 className="text-2xl font-bold">Something Went Wrong</h2>
      <p className="text-muted-foreground">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button
        variant="gradient"
        onClick={() => {
          reset();
          void router.invalidate();
        }}
      >
        Try Again
      </Button>
    </div>
  );
}
