import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRouter,
  RouterProvider,
  type RouterHistory,
} from "@tanstack/react-router";
import { AuthContext, type User } from "../auth/AuthContext";
import { Loading } from "../components/states/Loading";
import {
  NotFound,
  RouteErrorBoundary,
} from "../components/states/RouteErrorBoundary";
import type { RouterContext } from "./router-context";
import { routeTree } from "./routeTree.gen";

export function createAppRouter(
  context: RouterContext,
  history?: RouterHistory
) {
  return createRouter({
    routeTree,
    context,
    history,
    isServer: false,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: Loading,
    defaultErrorComponent: RouteErrorBoundary,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: typeof document !== "undefined",
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module "@tanstack/react-router" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- Router registers its type via declaration merging.
  interface Register {
    router: AppRouter;
  }
}

export function RouterView({
  router,
  user = router.options.context.authService.getUser(),
}: {
  router: AppRouter;
  user?: User | null;
}) {
  const { authService, getAuthToken, queryClient } = router.options.context;
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext
        value={{
          user: user ?? undefined,
          getIdToken: user ? getAuthToken : undefined,
          signOut: () => authService.signOut(),
        }}
      >
        <RouterProvider router={router} />
      </AuthContext>
    </QueryClientProvider>
  );
}
