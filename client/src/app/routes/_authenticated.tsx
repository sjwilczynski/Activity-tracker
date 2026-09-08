import { CancelledError } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticatedShell } from "../AuthenticatedShell";
import { authenticatedQueries } from "../route-queries";

export const Route = createFileRoute("/_authenticated")({
  context: ({ context }) => authenticatedQueries(context.getAuthToken),
  beforeLoad: async ({ context, location }) => {
    await context.authService.waitForAuth();
    const user = context.authService.getUser();
    if (!user) {
      throw redirect({
        to: "/login",
        search: { returnTo: location.href },
        replace: true,
      });
    }
    return { user };
  },
  loader: ({ context }) => {
    void context.queryClient
      .query(context.preferencesQuery)
      .catch((error: unknown) => {
        if (!(error instanceof CancelledError))
          console.error("Preferences prefetch failed", error);
      });
  },
  component: AuthenticatedShell,
});
