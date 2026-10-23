import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addActivityNameMutationOptions,
  addCategoryMutationOptions,
  assignActivityCategoryMutationOptions,
  deleteActivityMutationOptions,
  deleteCategoryMutationOptions,
  editCategoryMutationOptions,
  restoreBackupMutationOptions,
} from "./actions";

afterEach(() => vi.unstubAllGlobals());

function setup() {
  const queryClient = new QueryClient();
  return { queryClient, getAuthToken: async () => "token" };
}

describe("shared mutation validation and wire contracts", () => {
  it("rejects invalid deletion modes, missing IDs and reassignment to the same category", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const ctx = setup();
    const remove = new MutationObserver(
      ctx.queryClient,
      deleteCategoryMutationOptions(ctx)
    );
    await expect(
      // @ts-expect-error Typed callers cannot dispatch an unknown destructive operation.
      remove.mutate({ id: "sports", mode: "unknown" })
    ).rejects.toThrow("Invalid category deletion mode");
    await expect(
      remove.mutate({
        id: "sports",
        mode: "reassign",
        targetCategoryId: "sports",
      })
    ).rejects.toThrow("must be different");
    await expect(remove.mutate({ id: "", mode: "delete" })).rejects.toThrow(
      "cannot be empty"
    );
    await expect(
      new MutationObserver(
        ctx.queryClient,
        deleteActivityMutationOptions(ctx)
      ).mutate("")
    ).rejects.toThrow("cannot be empty");
    expect(fetch).not.toHaveBeenCalled();
    ctx.queryClient.clear();
  });

  it("rejects category/name commands using shared validators before transport", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const ctx = setup();
    await expect(
      new MutationObserver(
        ctx.queryClient,
        addCategoryMutationOptions(ctx)
      ).mutate({
        name: "Sports",
        description: "",
        active: true,
        activityNames: ["Running", " running "],
      })
    ).rejects.toThrow("Duplicate activity name");
    await expect(
      new MutationObserver(
        ctx.queryClient,
        addActivityNameMutationOptions(ctx)
      ).mutate({
        activityName: " ",
        categoryId: "sports",
      })
    ).rejects.toThrow("cannot be empty");
    await expect(
      new MutationObserver(
        ctx.queryClient,
        assignActivityCategoryMutationOptions(ctx)
      ).mutate({
        activityName: "Running",
        categoryId: "",
      })
    ).rejects.toThrow("cannot be empty");
    expect(fetch).not.toHaveBeenCalled();
    ctx.queryClient.clear();
  });

  it("preserves existing name identities when editing a category", async () => {
    const requests: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, init) => {
        requests.push({ url, body: JSON.parse(init.body) });
        return new Response(null, { status: 200 });
      })
    );
    const ctx = setup();
    await new MutationObserver(
      ctx.queryClient,
      editCategoryMutationOptions(ctx)
    ).mutate({
      id: "sports/id",
      category: {
        name: " Sports ",
        description: "Existing description",
        active: false,
        activityNames: ["Running", " running "],
      },
    });
    expect(requests).toEqual([
      {
        url: "/api/categories/sports%2Fid",
        body: {
          name: "Sports",
          description: "Existing description",
          active: false,
          activityNames: ["Running", " running "],
        },
      },
    ]);
    ctx.queryClient.clear();
  });

  it("normalizes new activity names but never normalizes existing assignment identities", async () => {
    const bodies: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        bodies.push(JSON.parse(init.body));
        return new Response(null, { status: 200 });
      })
    );
    const ctx = setup();
    await new MutationObserver(
      ctx.queryClient,
      addActivityNameMutationOptions(ctx)
    ).mutate({
      activityName: " Running ",
      categoryId: "sports",
    });
    await new MutationObserver(
      ctx.queryClient,
      assignActivityCategoryMutationOptions(ctx)
    ).mutate({
      activityName: " Running ",
      categoryId: "wellness",
    });
    expect(bodies).toEqual([
      { activityName: "Running" },
      { activityName: " Running ", categoryId: "wellness" },
    ]);
    ctx.queryClient.clear();
  });

  it("restores backup details, optional preferences and distinct name identities without schema changes", async () => {
    const bodies: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        bodies.push(JSON.parse(init.body));
        return new Response(null, { status: 200 });
      })
    );
    const ctx = setup();
    const backup = {
      activities: {
        a: {
          date: "2026-09-06",
          name: " Running ",
          intensity: "high" as const,
          timeSpent: 25,
          description: "Hills",
        },
        b: { date: "2026-09-06", name: "Running" },
      },
      categories: {
        sports: {
          name: "Sports",
          description: "",
          active: true,
          activityNames: [" Running ", "Running"],
        },
      },
      preferences: {
        funAnimations: false,
        groupByCategory: true,
        isLightTheme: false,
      },
    };
    await new MutationObserver(
      ctx.queryClient,
      restoreBackupMutationOptions(ctx)
    ).mutate(backup);
    expect(bodies).toEqual([backup]);
    ctx.queryClient.clear();
  });

  it("rejects an invalid backup before replacing any user data", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const ctx = setup();
    const restore = new MutationObserver(
      ctx.queryClient,
      restoreBackupMutationOptions(ctx)
    );
    await expect(
      restore.mutate({
        activities: { a: { date: "2026-02-30", name: "Running" } },
        categories: {},
      })
    ).rejects.toThrow("valid calendar date");
    // @ts-expect-error The typed restore interface requires both collections.
    await expect(restore.mutate({ activities: {} })).rejects.toThrow(
      "categories must be"
    );
    expect(fetch).not.toHaveBeenCalled();
    ctx.queryClient.clear();
  });
});
