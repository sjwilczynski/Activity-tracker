import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { Button } from "../ui/button";

export function RouteErrorBoundary() {
  const error = useRouteError();

  // Unauthorized (401, 403)
  if (
    isRouteErrorResponse(error) &&
    (error.status === 401 || error.status === 403)
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center p-8">
        <h2 className="text-2xl font-bold">Session Expired</h2>
        <p className="text-muted-foreground">
          Please sign in again to continue
        </p>
        <Button variant="gradient" asChild>
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Not Found (404)
  if (isRouteErrorResponse(error) && error.status === 404) {
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

  // General Error (500, network, etc.)
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center p-8">
      <h2 className="text-2xl font-bold">Something Went Wrong</h2>
      <p className="text-muted-foreground">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button variant="gradient" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}
