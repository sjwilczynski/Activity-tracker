import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addActivitiesMutationOptions,
  deleteCategoryMutationOptions,
  restoreBackupMutationOptions,
} from "./actions";

afterEach(() => vi.unstubAllGlobals());

const cacheKeys = [
  ["activities"],
  ["activitiesWithLimit", 5],
  ["activitiesWithLimit", 20],
  ["categories"],
  ["preferences"],
  ["unrelated"],
] as const;

function setup() {
  const queryClient = new QueryClient();
  for (const key of cacheKeys) queryClient.setQueryData(key, []);
  return { queryClient, getAuthToken: async () => "token" };
}

function expectInvalidations(queryClient: QueryClient, expected: string[]) {
  for (const key of cacheKeys) {
    expect(queryClient.getQueryState(key)?.isInvalidated, key.join("/")).toBe(
      expected.includes(key[0])
    );
  }
  queryClient.clear();
}

describe("native mutation effects", () => {
  it("adding an entry invalidates every limited list without refreshing unrelated families", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 200 }))
    );
    const ctx = setup();
    await new MutationObserver(
      ctx.queryClient,
      addActivitiesMutationOptions(ctx)
    ).mutate([{ date: "2026-09-06", name: "Running", categoryId: "sports" }]);
    expectInvalidations(ctx.queryClient, ["activities", "activitiesWithLimit"]);
  });

  it("uses reassignment-specific context if category deletion fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response(null, { status: 500 }))
    );
    const ctx = setup();
    await expect(
      new MutationObserver(
        ctx.queryClient,
        deleteCategoryMutationOptions(ctx)
      ).mutate({
        id: "sports",
        mode: "reassign",
        targetCategoryId: "wellness",
      })
    ).rejects.toMatchObject({
      message:
        "Activities reassigned, but the category could not be deleted. Request failed (status: 500)",
      status: 500,
    });
    expectInvalidations(ctx.queryClient, [
      "activities",
      "activitiesWithLimit",
      "categories",
    ]);
  });

  it.each([400, 401, 404, 409, 500])(
    "stops on first-step HTTP %s without refreshing unstarted category deletion",
    async (status) => {
      const fetch = vi.fn(
        async () => new Response("First step failed", { status })
      );
      vi.stubGlobal("fetch", fetch);
      const ctx = setup();
      await expect(
        new MutationObserver(
          ctx.queryClient,
          deleteCategoryMutationOptions(ctx)
        ).mutate({
          id: "sports",
          mode: "delete",
        })
      ).rejects.toMatchObject({
        message:
          status >= 500 ? "Request failed (status: 500)" : "First step failed",
        status,
      });
      expect(fetch).toHaveBeenCalledTimes(1);
      expectInvalidations(
        ctx.queryClient,
        status === 409 || status >= 500
          ? ["activities", "activitiesWithLimit"]
          : []
      );
    }
  );

  it("refreshes only completed deletions when category deletion is explicitly rejected", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response("Not permitted", { status: 403 }))
    );
    const ctx = setup();
    await expect(
      new MutationObserver(
        ctx.queryClient,
        deleteCategoryMutationOptions(ctx)
      ).mutate({
        id: "sports",
        mode: "delete",
      })
    ).rejects.toMatchObject({
      message:
        "Activities deleted, but the category could not be deleted. Not permitted",
      status: 403,
    });
    expectInvalidations(ctx.queryClient, ["activities", "activitiesWithLimit"]);
  });

  it.each([1, 2])(
    "refreshes completed/uncertain steps only when response %s is lost",
    async (lostStep) => {
      const fetch = vi.fn().mockRejectedValue(new Error("Response lost"));
      if (lostStep === 2)
        fetch.mockResolvedValueOnce(new Response(null, { status: 200 }));
      vi.stubGlobal("fetch", fetch);
      const ctx = setup();
      await expect(
        new MutationObserver(
          ctx.queryClient,
          deleteCategoryMutationOptions(ctx)
        ).mutate({
          id: "sports",
          mode: "delete",
        })
      ).rejects.toThrow("Response lost");
      expect(fetch).toHaveBeenCalledTimes(lostStep);
      expectInvalidations(ctx.queryClient, [
        "activities",
        "activitiesWithLimit",
        ...(lostStep === 2 ? ["categories"] : []),
      ]);
    }
  );

  it("does not invalidate or dispatch when auth fails before the first request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const ctx = {
      ...setup(),
      getAuthToken: async () => {
        throw new Error("Signed out");
      },
    };
    await expect(
      new MutationObserver(
        ctx.queryClient,
        restoreBackupMutationOptions(ctx)
      ).mutate({
        activities: {},
        categories: {},
      })
    ).rejects.toThrow("Signed out");
    expect(fetch).not.toHaveBeenCalled();
    expectInvalidations(ctx.queryClient, []);
  });

  it("invalidates the first step if auth prevents starting the second", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const ctx = {
      ...setup(),
      getAuthToken: vi
        .fn()
        .mockResolvedValueOnce("token")
        .mockRejectedValueOnce(new Error("Signed out")),
    };
    await expect(
      new MutationObserver(
        ctx.queryClient,
        deleteCategoryMutationOptions(ctx)
      ).mutate({
        id: "sports",
        mode: "delete",
      })
    ).rejects.toThrow("Signed out");
    expect(fetch).toHaveBeenCalledTimes(1);
    expectInvalidations(ctx.queryClient, ["activities", "activitiesWithLimit"]);
  });
});
