# Activity Tracker: Router + Query integration example

This is the **design reference**, not a copy-paste implementation. The user authorized implementation at 20:07 CEST; the worktree was updated to `89ea859` (#1178). The implemented equivalents now live in `client/src/app/{router,session,session-host,route-queries}.ts(x)` and the generated file routes. Retain this example for the reasoning behind shared options; consult source and the [plan](../plans/2026-09-06-tanstack-router-migration.md) for current integration status.

The core rule from [TkDodo's fourth post](https://tkdodo.eu/blog/reliable-query-prefetching-with-tanstack-router): **construct concrete query options in route context; both loader and consumer use those options.** Keeping only the factory shared is not enough.

## 1. One runtime, one QueryClient

Proposed `client/src/app/router-context.ts`; type-only auth import does not initialize Firebase in consumers:

```ts
import type { QueryClient } from "@tanstack/react-query";
import type { authService } from "@/auth/authService";
import type { GetAuthToken } from "@/data/apiClient";

export type RouterContext = {
  queryClient: QueryClient;
  authService: Pick<typeof authService, "waitForAuth" | "getUser">;
  getAuthToken: GetAuthToken;
};
```

Proposed `client/src/app/routes/__root.tsx`:

```tsx
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { RouterContext } from "../router-context";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
});
```

Proposed internal `client/src/app/router.tsx` factory. The public session-runtime host owns its lifetime; individual pages do not call it:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRouter,
  RouterProvider,
  type RouterHistory,
} from "@tanstack/react-router";
import { Loading } from "@/components/states/Loading";
import { QueryRouteError } from "./QueryRouteError";
import { routeTree } from "./routeTree.gen";
import type { RouterContext } from "./router-context";

export function createAppRuntime(
  services: Omit<RouterContext, "queryClient">,
  history?: RouterHistory
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 10 * 60_000, gcTime: 10 * 60_000 },
    },
  });
  const router = createRouter({
    routeTree,
    history,
    context: { ...services, queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: Loading,
    defaultErrorComponent: QueryRouteError,
    scrollRestoration: true,
  });
  return { router, queryClient };
}

type AppRuntime = ReturnType<typeof createAppRuntime>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRuntime["router"];
  }
}

export function RuntimeView({ runtime }: { runtime: AppRuntime }) {
  return (
    <QueryClientProvider client={runtime.queryClient}>
      <RouterProvider router={runtime.router} />
    </QueryClientProvider>
  );
}
```

The session runtime module owns this factory and an AuthContext bridge. It accepts Firebase or deterministic auth adapters plus browser/memory history. It handles initialization, UID changes, retirement and cleanup behind one mounted host, not an ordering checklist repeated by callers. The route-facing auth type above is only the subset loaders need, not the whole host interface.

**Required internal policy:** token retrieval checks runtime identity before/after awaiting; retired work rejects rather than using a new account's token. Initialize without duplicate private loads; retire protected rendering, queries and route context on UID change; preserve the URL and dispose owned listeners only. The external auth subscription must outlive retired views. This factory is not a complete auth host: prove that module first as required in [task 1](../plans/2026-09-06-tanstack-router-migration.md#1-establish-the-post-upgrade-baseline-and-prove-tooling-compatibility).

## 2. Protected context creates shared options, not requests

Proposed `client/src/app/routes/_authenticated.tsx`:

```tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  activitiesQueryOptions,
  categoriesQueryOptions,
  preferencesQueryOptions,
} from "@/data/queryOptions";

export const Route = createFileRoute("/_authenticated")({
  context: ({ context }) => ({
    activitiesQuery: activitiesQueryOptions(context.getAuthToken),
    categoriesQuery: categoriesQueryOptions(context.getAuthToken),
    preferencesQuery: preferencesQueryOptions(context.getAuthToken),
  }),
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
    void context.queryClient.query(context.preferencesQuery).catch((error) => {
      console.error("Preferences prefetch failed", error);
    });
  },
  component: Outlet,
});
```

`/_authenticated` is a route **ID**, not a URL prefix. Its children still have URLs such as `/welcome`. The synchronous callback does not need a resolved user and does not fetch; the asynchronous guard prevents private descendant loaders from running when signed out. In production, replace `Outlet` with the extracted sidebar/AuthContext/theme shell from `_layout.tsx`, preserving its internal `Outlet`.

The login route must validate `returnTo` and normalize it to an allowed same-origin app destination before navigating. Preserve its query/hash, reject external/protocol-relative/backslash destinations, and prevent login redirect loops. Do not cast an untrusted URL to a typed route. The backend remains responsible for authorization.

Login actions belong behind the same auth seam: current `Login.tsx` calls Firebase directly, so injecting only guard functions or mocking `useAuth` cannot support an actual mocked login flow.

## 3. Dashboard: start everything early, choose blocking in consumers

Proposed `client/src/app/routes/_authenticated.welcome.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { activitiesWithLimitQueryOptions } from "@/data/queryOptions";
import { Welcome } from "@/pages/Welcome";

export const Route = createFileRoute("/_authenticated/welcome")({
  context: ({ context }) => ({
    recentActivitiesQuery: activitiesWithLimitQueryOptions(
      context.getAuthToken,
      5
    ),
  }),
  loader: ({ context }) => {
    for (const request of [
      context.queryClient.query(context.recentActivitiesQuery),
      context.queryClient.query(context.categoriesQuery),
      context.queryClient.query(context.activitiesQuery),
    ]) {
      void request.catch((error) =>
        console.error("Dashboard prefetch failed", error)
      );
    }
  },
  component: Welcome,
});
```

Proposed `client/src/pages/useWelcomeData.ts`, consumed by the existing page:

```ts
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/_authenticated/welcome");

export function useWelcomeData() {
  const context = routeApi.useRouteContext();
  const { data: recentActivities } = useSuspenseQuery(
    context.recentActivitiesQuery
  );
  const { data: categories } = useSuspenseQuery(context.categoriesQuery);
  const history = useQuery(context.activitiesQuery);
  return { recentActivities, categories, history };
}
```

Both critical requests and optional history start before the first Suspense hook can pause rendering. No second options construction occurs in this hook. Rejection handlers avoid unhandled promises and report failures; Query consumers still own visible error/retry UI. Existing ten-minute freshness avoids routine extra requests on mount; retries, staleness, focus, and invalidation can legitimately fetch again.

Recent activities/categories gate the dashboard; stats/heatmap use `history.data` with pending/error UI. Shared query hooks may use `getRouteApi("/_authenticated")`; query-aware stories must mount that actual ancestor/context, not an arbitrary wrapper. Pure rendering stories can stay isolated. Every page loader must start the queries its subtree needs; context alone does not prefetch.

For Activity List and Settings, retain their initial blocking policy:

```ts
loader: async ({ context }) => {
  await Promise.all([
    context.queryClient.query({ ...context.activitiesQuery, staleTime: "static" }),
    context.queryClient.query({ ...context.categoriesQuery, staleTime: "static" }),
  ]);
},
```

This returns no server data. The imperative `"static"` override preserves old `ensureQueryData` semantics: "have data", not "have fresh data". Hooks still consume the original finite-stale-time context options; **never put `"static"` on those shared options**, or mutations would stop triggering normal observer refreshes. See the [version mapping](../research/2026-09-06-tanstack-router.md#query-51028-adaptation).

## 4. Where `loaderDeps` belongs

Today's `startDate`, `endDate`, and `periods` filter already-fetched history **on the client**. Validate them, but do not add them to activity query keys or loader dependencies: the HTTP request is unchanged.

To illustrate the fourth post's parameter-dependent pattern, suppose a future feature made the existing recent-query `limit` configurable via the URL. This is a teaching-only variant of the welcome route, **not a proposed feature or second route**:

```ts
import { z } from "zod";

validateSearch: z.object({
  recentLimit: z.number().int().positive().optional(),
}),
loaderDeps: ({ search }) => ({ limit: search.recentLimit ?? 5 }),
context: ({ context, deps }) => ({
  recentActivitiesQuery: activitiesWithLimitQueryOptions(
    context.getAuthToken,
    deps.limit,
  ),
}),
```

The loader and `useWelcomeData` do not change. The existing factory includes the limit in its key. A direct link with `recentLimit=10` primes and observes the ten-record query, not an initial five-record query followed by a second request. Unrelated search changes do not recreate these options. Backend limit constraints must also be applied if this feature is ever added.

## 5. Error recovery and mutations are part of the integration

Proposed `client/src/app/QueryRouteError.tsx`, adapting the [official external-cache recovery pattern](https://tanstack.com/router/latest/docs/guide/external-data-loading):

```tsx
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";

export function QueryRouteError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const queryBoundary = useQueryErrorResetBoundary();
  useEffect(() => {
    queryBoundary.reset();
  }, [queryBoundary]);
  return (
    <div role="alert">
      <p>{error.message}</p>
      <button onClick={() => void router.invalidate()}>Try again</button>
    </div>
  );
}
```

Use the app's styled error views in production, and a separate `notFoundComponent` for unknown routes. Optional/background-query errors need inline feedback; handled prefetch rejections must not hide them.

The [native mutation example](tanstack-query-mutations.md) specifies typed operations, `mutationOptions`/`useMutation`, and one owner for targeted reconciliation. Preserve visible pending/error/reset/dialog behavior; don't retain synthetic Request/FormData route dispatch as the final interface.

Activity adds invalidate full/limited history; imports also affect categories/preferences. Inspected #1175 delete-all affects activity families only. Preserve partial/uncertain-write effects. Ordinary writes use Query invalidation, not blanket Router invalidation; auth and boundary recovery are different.
