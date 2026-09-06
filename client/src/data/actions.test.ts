import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runAction } from "./actions";

afterEach(() => vi.unstubAllGlobals());

function formRequest(values: Record<string, string>) {
  return new Request("http://localhost/settings", {
    method: "POST",
    body: new URLSearchParams(values),
  });
}

function context() {
  const queryClient = new QueryClient();
  for (const key of [
    "activities",
    "activitiesWithLimit",
    "categories",
    "preferences",
  ]) {
    queryClient.setQueryData([key], []);
  }
  return { queryClient, getAuthToken: async () => "token" };
}

describe("production client actions", () => {
  it("rejects unsupported intents instead of reporting success", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(
      await runAction(formRequest({ intent: "not-supported" }), context())
    ).toEqual({ error: "Unknown intent" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends merge consent only when explicitly confirmed", async () => {
    const requests: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        requests.push(JSON.parse(init.body));
        return new Response(null, { status: 200 });
      })
    );
    const values = {
      intent: "rename-activity",
      oldName: "Running",
      newName: "Yoga",
    };
    await runAction(formRequest(values), context());
    await runAction(
      formRequest({ ...values, merge: "true", targetCategoryId: "wellness" }),
      context()
    );
    expect(requests).toEqual([
      { oldName: "Running", newName: "Yoga" },
      {
        oldName: "Running",
        newName: "Yoga",
        merge: true,
        targetCategoryId: "wellness",
      },
    ]);
  });

  it("surfaces conflicts and refreshes activity and category data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Target changed", { status: 409 }))
    );
    const ctx = context();
    expect(
      await runAction(
        formRequest({
          intent: "rename-activity",
          oldName: "Running",
          newName: "Yoga",
        }),
        ctx
      )
    ).toEqual({ error: "Target changed", status: 409 });
    expect(ctx.queryClient.getQueryState(["categories"])?.isInvalidated).toBe(
      true
    );
  });

  it("reports partial deletion and refreshes successful changes", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response("Internal secret", { status: 500 }))
    );
    const ctx = context();
    expect(
      await runAction(
        formRequest({
          intent: "delete-category-with-activities",
          id: "sports",
        }),
        ctx
      )
    ).toEqual({
      error:
        "Activities changed, but the category could not be deleted. Request failed (status: 500)",
      status: 500,
    });
    expect(ctx.queryClient.getQueryState(["activities"])?.isInvalidated).toBe(
      true
    );
  });

  it("propagates network failures but invalidates earlier successful writes", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockRejectedValueOnce(new Error("Offline"))
    );
    const ctx = context();
    await expect(
      runAction(
        formRequest({
          intent: "delete-category-reassign",
          id: "sports",
          targetCategoryId: "wellness",
        }),
        ctx
      )
    ).rejects.toThrow("Offline");
    expect(ctx.queryClient.getQueryState(["categories"])?.isInvalidated).toBe(
      true
    );
  });

  it("invalidates preferences after a restore", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 200 }))
    );
    const ctx = context();
    expect(
      await runAction(
        formRequest({
          intent: "import",
          importData: JSON.stringify({ activities: {}, categories: {} }),
        }),
        ctx
      )
    ).toEqual({ ok: true });
    expect(ctx.queryClient.getQueryState(["preferences"])?.isInvalidated).toBe(
      true
    );
  });

  it.each(["network", "server"])(
    "refreshes all restored data after an uncertain %s acknowledgement",
    async (failure) => {
      let persisted = false;
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => {
          persisted = true;
          if (failure === "network") throw new Error("Response lost");
          return new Response("Internal secret", { status: 500 });
        })
      );
      const ctx = context();
      const operation = runAction(
        formRequest({
          intent: "import",
          importData: JSON.stringify({ activities: {}, categories: {} }),
        }),
        ctx
      );
      if (failure === "network") {
        await expect(operation).rejects.toThrow("Response lost");
      } else {
        await expect(operation).resolves.toEqual({
          error: "Request failed (status: 500)",
          status: 500,
        });
      }
      expect(persisted).toBe(true);
      for (const key of [
        "activities",
        "activitiesWithLimit",
        "categories",
        "preferences",
      ]) {
        expect(ctx.queryClient.getQueryState([key])?.isInvalidated).toBe(true);
      }
    }
  );
});
