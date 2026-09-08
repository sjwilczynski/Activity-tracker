import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { preferencesQueryOptions } from "../data/queryOptions";
import { createAppRouter } from "./router";
import { createTestAuth, requestUrl } from "./test-auth";

describe("optional route queries", () => {
  let queryClient: QueryClient;
  const auth = createTestAuth().auth;
  const getAuthToken = () => auth.getIdToken();
  const preferences = preferencesQueryOptions(getAuthToken);
  const fetchMock = vi.fn<typeof fetch>();
  const create = (path = "/compare") =>
    createAppRouter(
      { queryClient, authService: auth, getAuthToken },
      createMemoryHistory({ initialEntries: [path] })
    );
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.stubGlobal("window", { location: { origin: "https://example.test" } });
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps optional preference failures out of the route error boundary", async () => {
    const error = new Error("Network unavailable");
    fetchMock.mockImplementation((url) =>
      requestUrl(url).includes("/preferences")
        ? Promise.reject(error)
        : Promise.resolve(Response.json([]))
    );
    const router = create();
    await router.load();
    expect(router.state.matches.at(-1)?.status).toBe("success");
    await vi.waitFor(() =>
      expect(queryClient.getQueryState(preferences.queryKey)).toMatchObject({
        status: "error",
        error,
        data: undefined,
      })
    );
    expect(console.error).toHaveBeenCalledWith(
      "Preferences prefetch failed",
      error
    );
  });

  it.each(["/welcome", "/charts", "/compare"])(
    "does not report disposed optional requests as failures on %s",
    async (path) => {
      fetchMock.mockImplementation((input) =>
        requestUrl(input).includes("/activities") && path !== "/welcome"
          ? Promise.resolve(Response.json([]))
          : new Promise<Response>(() => {})
      );
      const router = create(path);
      await router.load();
      await queryClient.cancelQueries();
      expect(console.error).not.toHaveBeenCalled();
    }
  );

  it("does not turn a preference server failure into successful default settings", async () => {
    fetchMock.mockImplementation(async (url) =>
      requestUrl(url).includes("/preferences")
        ? new Response("Unavailable", { status: 503 })
        : Response.json([])
    );
    await create().load();
    await vi.waitFor(() =>
      expect(queryClient.getQueryState(preferences.queryKey)).toMatchObject({
        status: "error",
        data: undefined,
      })
    );
  });

  it("does not wait for optional preferences that remain pending", async () => {
    fetchMock.mockImplementation((url) =>
      requestUrl(url).includes("/preferences")
        ? new Promise<Response>(() => {})
        : Promise.resolve(Response.json([]))
    );
    const router = create();
    await router.load();
    expect(router.state.matches.at(-1)?.status).toBe("success");
    expect(queryClient.getQueryState(preferences.queryKey)).toMatchObject({
      status: "pending",
      fetchStatus: "fetching",
    });
  });

  it("reuses infinite-freshness preferences and refetches them after invalidation", async () => {
    const old = {
      groupByCategory: true,
      funAnimations: true,
      isLightTheme: true,
    };
    const next = { ...old, isLightTheme: false };
    queryClient.setQueryData(preferences.queryKey, old, { updatedAt: 1 });
    fetchMock.mockImplementation(async (url) =>
      Response.json(requestUrl(url).includes("/preferences") ? next : [])
    );
    const router = create();
    await router.load();
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        requestUrl(url).includes("/preferences")
      )
    ).toHaveLength(0);
    await queryClient.invalidateQueries({
      queryKey: preferences.queryKey,
      refetchType: "none",
    });
    await router.invalidate();
    await vi.waitFor(() =>
      expect(queryClient.getQueryData(preferences.queryKey)).toEqual(next)
    );
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        requestUrl(url).includes("/preferences")
      )
    ).toHaveLength(1);
  });

  it("starts recent history, categories and optional full history before dashboard rendering", async () => {
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    const router = create("/welcome");
    await router.load();
    const urls = fetchMock.mock.calls.map(([url]) => requestUrl(url));
    expect(urls).toContain("https://example.test/api/activities?limit=5");
    expect(urls).toContain("https://example.test/api/activities");
    expect(urls).toContain("/api/categories");
    expect(router.state.matches.at(-1)?.status).toBe("success");
    const context = router.state.matches.find(
      (match) => match.routeId === "/_authenticated/welcome"
    )!.context;
    expect(
      queryClient
        .getQueryCache()
        .find({ queryKey: context.recentActivitiesQuery.queryKey })?.options
        .queryFn
    ).toBe(context.recentActivitiesQuery.queryFn);
  });

  it("preserves dashboard failures in their respective query caches", async () => {
    const error = new Error("Dashboard unavailable");
    fetchMock.mockRejectedValue(error);
    const router = create("/welcome");
    await router.load();
    const context = router.state.matches.find(
      (match) => match.routeId === "/_authenticated/welcome"
    )!.context;
    await vi.waitFor(() => {
      for (const options of [
        context.recentActivitiesQuery,
        context.categoriesQuery,
        context.activitiesQuery,
      ]) {
        expect(queryClient.getQueryState(options.queryKey)).toMatchObject({
          status: "error",
          error,
        });
      }
    });
  });
});
