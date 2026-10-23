import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addActivitiesMutationOptions,
  deleteCategoryMutationOptions,
  renameActivityMutationOptions,
  restoreBackupMutationOptions,
} from "./actions";

afterEach(() => vi.unstubAllGlobals());

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

describe("typed production mutations", () => {
  it.each([
    { records: [], message: "Activities array cannot be empty" },
    {
      records: [{ date: "2026-02-30", name: "Running", categoryId: "sports" }],
      message: "valid calendar date",
    },
    {
      records: [{ date: "2026-09-06", name: "", categoryId: "sports" }],
      message: "Activity name cannot be empty",
    },
  ])(
    "rejects invalid commands before auth, writes or cache effects ($message)",
    async ({ records, message }) => {
      const fetch = vi.fn();
      vi.stubGlobal("fetch", fetch);
      const ctx = { ...context(), getAuthToken: vi.fn(async () => "token") };
      const mutation = new MutationObserver(
        ctx.queryClient,
        addActivitiesMutationOptions(ctx)
      );
      await expect(mutation.mutate(records)).rejects.toThrow(message);
      expect(mutation.getCurrentResult().isError).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
      expect(ctx.getAuthToken).not.toHaveBeenCalled();
      for (const key of [
        "activities",
        "activitiesWithLimit",
        "categories",
        "preferences",
      ]) {
        expect(ctx.queryClient.getQueryState([key])?.isInvalidated).toBe(false);
      }
      ctx.queryClient.clear();
    }
  );

  it("sends merge consent only when explicitly confirmed", async () => {
    const requests: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        requests.push(JSON.parse(init.body));
        return new Response(null, { status: 200 });
      })
    );
    const ctx = context();
    const mutation = new MutationObserver(
      ctx.queryClient,
      renameActivityMutationOptions(ctx)
    );
    await mutation.mutate({ oldName: "Running", newName: " Yoga " });
    await mutation.mutate({
      oldName: "Running",
      newName: " Yoga ",
      merge: true,
      targetCategoryId: "",
    });
    expect(requests).toEqual([
      { oldName: "Running", newName: "Yoga" },
      {
        oldName: "Running",
        newName: " Yoga ",
        merge: true,
        targetCategoryId: "",
      },
    ]);
    ctx.queryClient.clear();
  });

  it("rejects merge without a target identity and same-name rename", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const ctx = context();
    const mutation = new MutationObserver(
      ctx.queryClient,
      renameActivityMutationOptions(ctx)
    );
    await expect(
      // @ts-expect-error Runtime callers also cannot bypass confirmed merge validation.
      mutation.mutate({ oldName: "Running", newName: "Yoga", merge: true })
    ).rejects.toThrow("target category ID");
    await expect(
      mutation.mutate({ oldName: "Running", newName: "Running" })
    ).rejects.toThrow("must be different");
    expect(fetch).not.toHaveBeenCalled();
    ctx.queryClient.clear();
  });

  it("surfaces typed conflicts and refreshes category data without replaying the write", async () => {
    const fetch = vi.fn(
      async () => new Response("Target changed", { status: 409 })
    );
    vi.stubGlobal("fetch", fetch);
    const ctx = context();
    const mutation = new MutationObserver(
      ctx.queryClient,
      renameActivityMutationOptions(ctx)
    );
    await expect(
      mutation.mutate({ oldName: "Running", newName: "Yoga" })
    ).rejects.toMatchObject({ message: "Target changed", status: 409 });
    expect(mutation.getCurrentResult().error?.status).toBe(409);
    expect(ctx.queryClient.getQueryState(["categories"])?.isInvalidated).toBe(
      true
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    ctx.queryClient.clear();
  });

  it("reports partial deletion without leaking a server error body", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response("Internal secret", { status: 500 }))
    );
    const ctx = context();
    const mutation = new MutationObserver(
      ctx.queryClient,
      deleteCategoryMutationOptions(ctx)
    );
    await expect(
      mutation.mutate({ id: "sports", mode: "delete" })
    ).rejects.toMatchObject({
      message:
        "Activities deleted, but the category could not be deleted. Request failed (status: 500)",
      status: 500,
    });
    expect(ctx.queryClient.getQueryState(["activities"])?.isInvalidated).toBe(
      true
    );
    ctx.queryClient.clear();
  });

  it("preserves a lost-acknowledgement cause and refreshes earlier successful writes", async () => {
    const networkError = new TypeError("Offline");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockRejectedValueOnce(networkError)
    );
    const ctx = context();
    const mutation = new MutationObserver(
      ctx.queryClient,
      deleteCategoryMutationOptions(ctx)
    );
    await expect(
      mutation.mutate({
        id: "sports",
        mode: "reassign",
        targetCategoryId: "wellness",
      })
    ).rejects.toMatchObject({
      message: "Offline",
      cause: networkError,
    });
    expect(ctx.queryClient.getQueryState(["categories"])?.isInvalidated).toBe(
      true
    );
    ctx.queryClient.clear();
  });

  it.each(["success", "network", "server"])(
    "refreshes every restored family after %s acknowledgement",
    async (outcome) => {
      const fetch = vi.fn(async () => {
        if (outcome === "network") throw new Error("Response lost");
        return new Response("Internal secret", {
          status: outcome === "server" ? 500 : 200,
        });
      });
      vi.stubGlobal("fetch", fetch);
      const ctx = context();
      const mutation = new MutationObserver(
        ctx.queryClient,
        restoreBackupMutationOptions(ctx)
      );
      const operation = mutation.mutate({ activities: {}, categories: {} });
      if (outcome === "success")
        await expect(operation).resolves.toBeUndefined();
      else
        await expect(operation).rejects.toThrow(
          outcome === "network"
            ? "Response lost"
            : "Request failed (status: 500)"
        );
      expect(fetch).toHaveBeenCalledTimes(1);
      for (const key of [
        "activities",
        "activitiesWithLimit",
        "categories",
        "preferences",
      ]) {
        expect(ctx.queryClient.getQueryState([key])?.isInvalidated).toBe(true);
      }
      ctx.queryClient.clear();
    }
  );
});
