import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activitiesQueryOptions,
  categoriesQueryOptions,
} from "../data/queryOptions";
import { createAppRouter, type AppRouter } from "./router";
import { createTestAuth, requestUrl } from "./test-auth";

const requiredRoutes = [
  { path: "/activity-list", categories: true },
  { path: "/settings", categories: true },
  { path: "/charts", categories: false },
  { path: "/compare", categories: false },
];

describe(
  "generated routes and their shared query cache",
  { timeout: 15_000 },
  () => {
    let queryClient: QueryClient;
    let router: AppRouter;
    const fetchMock = vi.fn<typeof fetch>();
    const auth = createTestAuth().auth;
    const getAuthToken = () => auth.getIdToken();
    const activities = activitiesQueryOptions(getAuthToken);
    const categories = categoriesQueryOptions(getAuthToken);
    const create = (path: string) => {
      router = createAppRouter(
        { queryClient, authService: auth, getAuthToken },
        createMemoryHistory({ initialEntries: [path] })
      );
      return router;
    };
    const activityFetches = () =>
      fetchMock.mock.calls.filter(([url]) =>
        requestUrl(url).includes("/activities")
      );

    beforeEach(() => {
      queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      vi.stubGlobal("window", { location: { origin: "https://example.test" } });
      vi.stubGlobal("fetch", fetchMock);
      fetchMock.mockReset().mockImplementation(async () => Response.json([]));
    });
    afterEach(() => {
      queryClient.clear();
      router?.clearCache();
      vi.unstubAllGlobals();
    });

    describe.each(requiredRoutes)(
      "$path",
      ({ path, categories: needsCategories }) => {
        it("waits for every required cold query before committing the page", async () => {
          const responses: Array<() => void> = [];
          fetchMock.mockImplementation((input) => {
            const url = requestUrl(input);
            if (
              url.includes("/activities") ||
              (needsCategories && url.includes("/categories"))
            ) {
              return new Promise<Response>((resolve) => {
                responses.push(() => resolve(Response.json([])));
              });
            }
            return Promise.resolve(Response.json([]));
          });
          let completed = false;
          const loading = create(path)
            .load()
            .then(() => {
              completed = true;
            });
          const count = needsCategories ? 2 : 1;
          await vi.waitFor(() => expect(responses).toHaveLength(count));
          expect(completed).toBe(false);
          if (needsCategories) {
            responses[0]();
            await vi.waitFor(() =>
              expect(queryClient.getQueryData(activities.queryKey)).toEqual([])
            );
            expect(completed).toBe(false);
          }
          responses.at(-1)?.();
          await loading;
          expect(queryClient.getQueryData(activities.queryKey)).toEqual([]);
          expect(router.state.matches.at(-1)?.status).toBe("success");
        });

        it.each(["stale", "invalidated"] as const)(
          "uses %s cached history without a required request",
          async (state) => {
            queryClient.setQueryData(activities.queryKey, [], { updatedAt: 1 });
            queryClient.setQueryData(categories.queryKey, [], { updatedAt: 1 });
            if (state === "invalidated")
              await queryClient.invalidateQueries({ refetchType: "none" });
            await create(path).load();
            expect(activityFetches()).toHaveLength(0);
            expect(
              queryClient.getQueryState(activities.queryKey)
            ).toMatchObject({
              dataUpdatedAt: 1,
              isInvalidated: state === "invalidated",
            });
            if (needsCategories) {
              expect(
                fetchMock.mock.calls.filter(([url]) =>
                  requestUrl(url).includes("/categories")
                )
              ).toHaveLength(0);
            }
          }
        );

        it("puts required cold failures in the route error boundary", async () => {
          const error = new Error("Required data unavailable");
          fetchMock.mockImplementation((input) =>
            requestUrl(input).includes("/activities")
              ? Promise.reject(error)
              : Promise.resolve(Response.json([]))
          );
          await create(path).load();
          expect(router.state.matches.at(-1)).toMatchObject({
            status: "error",
            error,
          });
          expect(queryClient.getQueryState(activities.queryKey)).toMatchObject({
            status: "error",
            error,
          });
        });
      }
    );

    it("gives mounted observers the concrete route options and finite freshness", async () => {
      queryClient.setQueryData(activities.queryKey, [], { updatedAt: 1 });
      await create("/compare").load();
      const options = router.state.matches.find(
        (match) => match.routeId === "/_authenticated/compare"
      )!.context.activitiesQuery;
      expect(options.staleTime).toBe(600_000);
      const observer = new QueryObserver(queryClient, options);
      const unsubscribe = observer.subscribe(() => {});
      try {
        await vi.waitFor(() => expect(activityFetches()).toHaveLength(1));
        expect(observer.options.queryFn).toBe(options.queryFn);
        await queryClient.invalidateQueries({ queryKey: options.queryKey });
        expect(activityFetches()).toHaveLength(2);
        expect(observer.getCurrentResult().isStale).toBe(false);
      } finally {
        unsubscribe();
      }
    });

    it("does not block navigation on an observer's pending background refetch", async () => {
      await create("/compare").load();
      fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
      const options = router.state.matches.find(
        (match) => match.routeId === "/_authenticated/compare"
      )!.context.activitiesQuery;
      const observer = new QueryObserver(queryClient, options);
      const unsubscribe = observer.subscribe(() => {});
      try {
        void queryClient.invalidateQueries({ queryKey: options.queryKey });
        await vi.waitFor(() => expect(activityFetches()).toHaveLength(2));
        await router.invalidate();
        expect(observer.getCurrentResult().fetchStatus).toBe("fetching");
        expect(activityFetches()).toHaveLength(2);
      } finally {
        unsubscribe();
      }
    });

    it("allows explicit inactive invalidation to refetch a loader query", async () => {
      await create("/compare").load();
      await queryClient.invalidateQueries({
        queryKey: activities.queryKey,
        refetchType: "all",
      });
      expect(activityFetches()).toHaveLength(2);
      expect(
        queryClient.getQueryState(activities.queryKey)?.isInvalidated
      ).toBe(false);
    });

    it("keeps the same concrete options across client-only date/period navigation", async () => {
      await create("/compare?periods=year-2026").load();
      const context = router.state.matches.find(
        (match) => match.routeId === "/_authenticated/compare"
      )!.context;
      await router.navigate({
        to: "/compare",
        search: { periods: "month-2026-8", startDate: "2026-09-01" },
        replace: true,
      });
      expect(
        router.state.matches.find(
          (match) => match.routeId === "/_authenticated/compare"
        )!.context.activitiesQuery
      ).toBe(context.activitiesQuery);
      expect(activityFetches()).toHaveLength(1);
    });

    it("pushes date edits, carries search between pages and replaces compare edits", async () => {
      await create(
        "/activity-list?startDate=2026-09-01&campaign=personal"
      ).load();
      await router.navigate({
        to: ".",
        search: (previous) => ({ ...previous, endDate: "2026-09-30" }),
      });
      expect(router.history.location.pathname).toBe("/activity-list");
      expect(router.history.length).toBe(2);
      await router.navigate({ to: "/compare", search: (previous) => previous });
      await router.navigate({
        to: "/compare",
        search: (previous) => ({ ...previous, periods: "year-2026" }),
        replace: true,
      });
      expect(router.history.length).toBe(3);
      expect(
        new URLSearchParams(router.history.location.search).get("campaign")
      ).toBe("personal");
      router.history.back();
      await router.load();
      expect(router.history.location.pathname).toBe("/activity-list");
      expect(
        new URLSearchParams(router.history.location.search).get("endDate")
      ).toBe("2026-09-30");
      router.history.forward();
      await router.load();
      expect(router.history.location.pathname).toBe("/compare");
      expect(
        new URLSearchParams(router.history.location.search).get("periods")
      ).toBe("year-2026");
      expect(activityFetches()).toHaveLength(1);
    });
  }
);
