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
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network unavailable"))
    );

    await expect(clientLoader()).resolves.toBeNull();
    await vi.waitFor(() => {
      expect(
        queryClient.getQueryState(
          preferencesQueryOptions(getAuthToken).queryKey
        )?.status
      ).toBe("error");
    });
  });
});
