import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runAction } from "./actions";

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

function request(intent: string, fields: Record<string, string> = {}) {
  return new Request("http://localhost/settings", {
    method: "POST",
    body: new URLSearchParams({ intent, ...fields }),
  });
}

function expectInvalidations(queryClient: QueryClient, expected: string[]) {
  for (const key of cacheKeys) {
    expect(queryClient.getQueryState(key)?.isInvalidated, key.join("/")).toBe(
      expected.includes(key[0])
    );
  }
}

describe("mutation effects", () => {
  it("adding an entry invalidates activity lists without refreshing categories or preferences", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 200 }))
    );
    const ctx = setup();
    expect(
      await runAction(request("add", { activities: "[]" }), ctx, "welcome")
    ).toEqual({ ok: true });
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
    expect(
      await runAction(
        request("delete-category-reassign", {
          id: "sports",
          targetCategoryId: "wellness",
        }),
        setup(),
        "settings"
      )
    ).toEqual({
      error:
        "Activities reassigned, but the category could not be deleted. Request failed (status: 500)",
      status: 500,
    });
  });

  it.each([400, 401, 404, 409, 500])(
    "stops on first-step HTTP %s and never refreshes data for an unstarted category deletion",
    async (status) => {
      const fetch = vi.fn(
        async () => new Response("First step failed", { status })
      );
      vi.stubGlobal("fetch", fetch);
      const ctx = setup();
      const result = await runAction(
        request("delete-category-with-activities", { id: "sports" }),
        ctx,
        "settings"
      );
      expect(result).toEqual({
        error:
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

  it("refreshes only completed deletions when the category delete is explicitly rejected", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response("Not permitted", { status: 403 }))
    );
    const ctx = setup();
    expect(
      await runAction(
        request("delete-category-with-activities", { id: "sports" }),
        ctx,
        "settings"
      )
    ).toEqual({
      error:
        "Activities deleted, but the category could not be deleted. Not permitted",
      status: 403,
    });
    expectInvalidations(ctx.queryClient, ["activities", "activitiesWithLimit"]);
  });

  it("refreshes only the attempted first step when its response is lost", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("Response lost"));
    vi.stubGlobal("fetch", fetch);
    const ctx = setup();
    await expect(
      runAction(
        request("delete-category-with-activities", { id: "sports" }),
        ctx,
        "settings"
      )
    ).rejects.toThrow("Response lost");
    expect(fetch).toHaveBeenCalledTimes(1);
    expectInvalidations(ctx.queryClient, ["activities", "activitiesWithLimit"]);
  });

  it("refreshes both completed and uncertain steps when the second response is lost", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockRejectedValueOnce(new Error("Response lost"))
    );
    const ctx = setup();
    await expect(
      runAction(
        request("delete-category-with-activities", { id: "sports" }),
        ctx,
        "settings"
      )
    ).rejects.toThrow("Response lost");
    expectInvalidations(ctx.queryClient, [
      "activities",
      "activitiesWithLimit",
      "categories",
    ]);
  });

  it("does not invalidate or dispatch when authentication fails before any request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const ctx = setup();
    await expect(
      runAction(
        request("import", { importData: "{}" }),
        {
          ...ctx,
          getAuthToken: async () => {
            throw new Error("Signed out");
          },
        },
        "welcome"
      )
    ).rejects.toThrow("Signed out");
    expect(fetch).not.toHaveBeenCalled();
    expectInvalidations(ctx.queryClient, []);
  });

  it("invalidates the first step if authentication prevents starting the second step", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const ctx = setup();
    await expect(
      runAction(
        request("delete-category-with-activities", { id: "sports" }),
        {
          ...ctx,
          getAuthToken: vi
            .fn()
            .mockResolvedValueOnce("token")
            .mockRejectedValueOnce(new Error("Signed out")),
        },
        "settings"
      )
    ).rejects.toThrow("Signed out");
    expect(fetch).toHaveBeenCalledTimes(1);
    expectInvalidations(ctx.queryClient, ["activities", "activitiesWithLimit"]);
  });
});
