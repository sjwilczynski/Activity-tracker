import {
  MutationObserver,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import {
  addActivitiesMutationOptions,
  deleteCategoryMutationOptions,
} from "./actions";

afterEach(() => vi.unstubAllGlobals());

function observeFamilies(client: QueryClient) {
  const reads: string[] = [];
  const stops = [
    "activities",
    "activitiesWithLimit",
    "categories",
    "preferences",
  ].map((key) => {
    client.setQueryData([key], []);
    return new QueryObserver(client, {
      queryKey: [key],
      staleTime: Infinity,
      queryFn: async () => {
        reads.push(key);
        return [];
      },
    }).subscribe(() => {});
  });
  return { reads, stop: () => stops.forEach((stop) => stop()) };
}

it("adds through a native mutation and refreshes only active affected families once", async () => {
  const client = new QueryClient();
  const { reads, stop } = observeFamilies(client);
  const fetch = vi.fn(async () => new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetch);
  const observer = new MutationObserver(
    client,
    addActivitiesMutationOptions({
      queryClient: client,
      getAuthToken: async () => "token",
    })
  );
  try {
    await expect(
      observer.mutate([
        { date: "2026-09-06", name: "Running", categoryId: "sports" },
      ])
    ).resolves.toBeUndefined();
    expect(observer.getCurrentResult().isSuccess).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(reads.sort()).toEqual(["activities", "activitiesWithLimit"]);
  } finally {
    stop();
    client.clear();
  }
});

it("refreshes each active family once after both ordered category deletion writes", async () => {
  const client = new QueryClient();
  const { reads, stop } = observeFamilies(client);
  const fetch = vi.fn(async () => new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetch);
  try {
    await new MutationObserver(
      client,
      deleteCategoryMutationOptions({
        queryClient: client,
        getAuthToken: async () => "token",
      })
    ).mutate({ id: "sports", mode: "delete" });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(reads.sort()).toEqual([
      "activities",
      "activitiesWithLimit",
      "categories",
    ]);
  } finally {
    stop();
    client.clear();
  }
});

it("does not reinterpret a committed command when caller-owned variables change", async () => {
  const client = new QueryClient();
  client.setQueryData(["activities"], []);
  const records = [
    { date: "2026-09-06", name: "Running", categoryId: "sports" },
  ];
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      records[0].name = "";
      return new Response(null, { status: 200 });
    })
  );
  try {
    await expect(
      new MutationObserver(
        client,
        addActivitiesMutationOptions({
          queryClient: client,
          getAuthToken: async () => "token",
        })
      ).mutate(records)
    ).resolves.toBeUndefined();
    expect(client.getQueryState(["activities"])?.isInvalidated).toBe(true);
  } finally {
    client.clear();
  }
});
