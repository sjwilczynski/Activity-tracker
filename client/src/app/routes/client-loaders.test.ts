import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activitiesQueryOptions,
  activitiesWithLimitQueryOptions,
  categoriesQueryOptions,
} from "../../data/queryOptions";
import { clientLoader as activityListLoader } from "./activity-list";
import { clientLoader as chartsLoader } from "./charts";
import { clientLoader as compareLoader } from "./compare";
import { clientLoader as settingsLoader } from "./settings";
import { clientLoader as welcomeLoader } from "./welcome";

const { authService, getLoadContext } = vi.hoisted(() => ({
  authService: { waitForAuth: vi.fn<() => Promise<void>>() },
  getLoadContext: vi.fn(),
}));

vi.mock("../../auth/authService", () => ({ authService }));
vi.mock("../root", () => ({ getLoadContext }));

const getAuthToken = async () => "test-token";
const activities = activitiesQueryOptions(getAuthToken);
const categories = categoriesQueryOptions(getAuthToken);
const recentActivities = activitiesWithLimitQueryOptions(getAuthToken);
const routes = [
  {
    name: "activity list",
    load: activityListLoader,
    keys: [activities.queryKey, categories.queryKey],
  },
  { name: "charts", load: chartsLoader, keys: [activities.queryKey] },
  { name: "compare", load: compareLoader, keys: [activities.queryKey] },
  {
    name: "settings",
    load: settingsLoader,
    keys: [activities.queryKey, categories.queryKey],
  },
  { name: "welcome", load: welcomeLoader, keys: [recentActivities.queryKey] },
];

describe("required route queries", () => {
  let queryClient: QueryClient;
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    authService.waitForAuth.mockResolvedValue(undefined);
    getLoadContext.mockReturnValue({
      queryClient,
      getAuthToken,
      authService,
    });
    vi.stubGlobal("window", { location: { origin: "https://example.test" } });
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockImplementation(async () => Response.json([]));
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
  });

  describe.each(routes)("$name", ({ load, keys }) => {
    it("waits for every required cold query before completing", async () => {
      const respond: Array<() => void> = [];
      fetchMock.mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            respond.push(() => resolve(Response.json([])));
          })
      );
      let completed = false;
      const loading = load().then((result) => {
        completed = true;
        return result;
      });

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(keys.length);
      });
      expect(completed).toBe(false);
      if (keys.length > 1) {
        respond.slice(0, -1).forEach((resolve) => resolve());
        await vi.waitFor(() => {
          expect(
            queryClient
              .getQueryCache()
              .getAll()
              .filter((query) => query.state.status === "success")
          ).toHaveLength(keys.length - 1);
        });
        expect(completed).toBe(false);
      }
      respond.at(-1)?.();

      await expect(loading).resolves.toBeNull();
      keys.forEach((key) => {
        expect(queryClient.getQueryData(key)).toEqual([]);
      });
    });

    it.each(["stale", "invalidated"] as const)(
      "uses %s cached data without fetching or delaying navigation",
      async (state) => {
        keys.forEach((key) => {
          queryClient.setQueryData(key, [], { updatedAt: 1 });
        });
        if (state === "invalidated") {
          await queryClient.invalidateQueries({ refetchType: "none" });
        }

        await expect(load()).resolves.toBeNull();

        expect(fetchMock).not.toHaveBeenCalled();
        keys.forEach((key) => {
          expect(queryClient.getQueryState(key)?.dataUpdatedAt).toBe(1);
          expect(queryClient.getQueryState(key)?.isInvalidated).toBe(
            state === "invalidated"
          );
        });
      }
    );

    it("propagates required cold query failures to the route", async () => {
      const error = new Error("Required data unavailable");
      fetchMock.mockRejectedValue(error);

      await expect(load()).rejects.toBe(error);

      keys.forEach((key) => {
        expect(queryClient.getQueryState(key)).toMatchObject({
          status: "error",
          error,
        });
      });
    });
  });

  it("leaves stale data eligible for a hook's mount refetch after loading", async () => {
    await chartsLoader();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const observer = new QueryObserver(queryClient, activities);
    const unsubscribe = observer.subscribe(() => {});
    try {
      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(observer.getCurrentResult().fetchStatus).toBe("idle");
      });
      expect(observer.getCurrentResult().isStale).toBe(true);
    } finally {
      unsubscribe();
    }
  });

  it("does not block navigation on a hook's pending background refetch", async () => {
    await chartsLoader();
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    const observer = new QueryObserver(queryClient, activities);
    const unsubscribe = observer.subscribe(() => {});
    try {
      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });

      await expect(chartsLoader()).resolves.toBeNull();

      expect(observer.getCurrentResult().fetchStatus).toBe("fetching");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      unsubscribe();
    }
  });

  it("allows invalidation to refetch an active hook after a cached loader call", async () => {
    await chartsLoader();
    const observer = new QueryObserver(queryClient, {
      ...activities,
      staleTime: Infinity,
    });
    const unsubscribe = observer.subscribe(() => {});
    try {
      await chartsLoader();
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await queryClient.invalidateQueries({ queryKey: activities.queryKey });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(observer.getCurrentResult().fetchStatus).toBe("idle");
      expect(observer.getCurrentResult().data).toEqual([]);
    } finally {
      unsubscribe();
    }
  });

  it("allows inactive loader queries to be explicitly refetched by invalidation", async () => {
    await chartsLoader();

    await queryClient.invalidateQueries({
      queryKey: activities.queryKey,
      refetchType: "all",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryState(activities.queryKey)?.isInvalidated).toBe(
      false
    );
  });
});
