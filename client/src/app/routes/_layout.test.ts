import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { preferencesQueryOptions } from "../../data/queryOptions";
import { clientLoader } from "./_layout";

const { authService, getLoadContext } = vi.hoisted(() => ({
  authService: {
    waitForAuth: vi.fn<() => Promise<void>>(),
    isSignedIn: vi.fn<() => boolean>(),
  },
  getLoadContext: vi.fn(),
}));

vi.mock("../../auth/authService", () => ({ authService }));
vi.mock("../root", () => ({ getLoadContext }));

describe("authenticated layout loader", () => {
  let queryClient: QueryClient;
  const getAuthToken = async () => "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    authService.waitForAuth.mockResolvedValue(undefined);
    authService.isSignedIn.mockReturnValue(true);
    getLoadContext.mockReturnValue({
      queryClient,
      getAuthToken,
      authService,
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
  });

  it("keeps optional preference failures out of the route error boundary", async () => {
    const error = new Error("Network unavailable");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

    await expect(clientLoader()).resolves.toBeNull();
    await vi.waitFor(() => {
      expect(
        queryClient.getQueryState(
          preferencesQueryOptions(getAuthToken).queryKey
        )
      ).toMatchObject({ status: "error", error, data: undefined });
    });
  });

  it("does not wait for optional preferences that remain pending indefinitely", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    await expect(clientLoader()).resolves.toBeNull();

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    expect(
      queryClient.getQueryState(preferencesQueryOptions(getAuthToken).queryKey)
    ).toMatchObject({ status: "pending", fetchStatus: "fetching" });
  });

  it("reuses cached preferences but refetches them after invalidation", async () => {
    const queryKey = preferencesQueryOptions(getAuthToken).queryKey;
    const cachedPreferences = {
      groupByCategory: true,
      funAnimations: true,
      isLightTheme: true,
    };
    const updatedPreferences = { ...cachedPreferences, isLightTheme: false };
    queryClient.setQueryData(queryKey, cachedPreferences, { updatedAt: 1 });
    const fetchMock = vi.fn(async () => Response.json(updatedPreferences));
    vi.stubGlobal("fetch", fetchMock);

    await expect(clientLoader()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();

    await queryClient.invalidateQueries({ queryKey, refetchType: "none" });
    await expect(clientLoader()).resolves.toBeNull();

    await vi.waitFor(() => {
      expect(queryClient.getQueryData(queryKey)).toEqual(updatedPreferences);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
