import type { Decorator } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, type AnyRoute } from "@tanstack/react-router";
import { Suspense, useEffect, type ReactNode } from "react";
import { routeTree } from "../src/app/routeTree.gen";
import { AuthContext } from "../src/auth/AuthContext";
import { Loading } from "../src/components/states/Loading";
import {
  NotFound,
  RouteErrorBoundary,
} from "../src/components/states/RouteErrorBoundary";
import { StylesProvider } from "../src/components/styles/StylesProvider";
import { Toaster } from "../src/components/ui/sonner";
import { createStoryAuth, mockUser } from "../src/mocks/auth";

function applyStoryDefaults(route: AnyRoute) {
  route.update({
    errorComponent: route.options.errorComponent ?? RouteErrorBoundary,
    pendingComponent: route.options.pendingComponent ?? Loading,
    notFoundComponent: route.options.notFoundComponent ?? NotFound,
    pendingMs: 0,
    pendingMinMs: 0,
  });
  for (const child of route.children ?? []) applyStoryDefaults(child);
}

applyStoryDefaults(routeTree);
export { routeTree };

export function createStoryServices(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 600_000 },
    },
  });
  const user = path === "/login" ? null : mockUser;
  const authService = createStoryAuth(user);
  const getAuthToken = () => authService.getIdToken();
  return {
    routerContext: { queryClient, authService, getAuthToken },
    user,
  };
}

export function StoryLayout() {
  return (
    <StylesProvider>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
      <Toaster />
    </StylesProvider>
  );
}

function StoryProviders({
  children,
  services,
}: {
  children: ReactNode;
  services: ReturnType<typeof createStoryServices>;
}) {
  const { queryClient, authService, getAuthToken } = services.routerContext;
  useEffect(() => () => queryClient.clear(), [queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext
        value={{
          user: services.user ?? undefined,
          getIdToken: services.user ? getAuthToken : undefined,
          signOut: () => authService.signOut(),
        }}
      >
        {children}
      </AuthContext>
    </QueryClientProvider>
  );
}

export const withStoryServices: Decorator = (Story, context) => (
  <StoryProviders services={context.loaded.services}>
    <Story />
  </StoryProviders>
);
