import {
  MutationObserver,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query";
import { afterEach, expect, expectTypeOf, it, vi } from "vitest";
import {
  addActivitiesMutationOptions,
  deleteAllActivitiesMutationOptions,
  deleteCategoryMutationOptions,
  renameActivityMutationOptions,
} from "./actions";
import type { ActivityRecordServer } from "./types";

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

it("binds each use of the same mutation definition to its own account and cache", async () => {
  const alice = new QueryClient();
  const bob = new QueryClient();
  alice.setQueryData(["activities"], ["alice"]);
  bob.setQueryData(["activities"], ["bob"]);
  const fetch = vi.fn<typeof globalThis.fetch>(
    async () => new Response(null, { status: 200 })
  );
  vi.stubGlobal("fetch", fetch);
  const forAccount = (queryClient: QueryClient, token: string) =>
    new MutationObserver(
      queryClient,
      addActivitiesMutationOptions({
        queryClient,
        getAuthToken: async () => token,
      })
    );
  const aliceMutation = forAccount(alice, "alice-token");
  const bobMutation = forAccount(bob, "bob-token");
  const records = [
    { date: "2026-09-06", name: "Running", categoryId: "sports" },
  ];
  try {
    await aliceMutation.mutate(records);
    expect(alice.getQueryState(["activities"])?.isInvalidated).toBe(true);
    expect(bob.getQueryState(["activities"])?.isInvalidated).toBe(false);
    await bobMutation.mutate(records);
    expect(bob.getQueryState(["activities"])?.isInvalidated).toBe(true);
    expect(
      fetch.mock.calls.map(([, init]) =>
        new Headers(init?.headers).get("x-auth-token")
      )
    ).toEqual(["alice-token", "bob-token"]);
  } finally {
    alice.clear();
    bob.clear();
  }
});

it("preserves typed variables and explicit merge consent through native options", () => {
  const queryClient = new QueryClient();
  const context = { queryClient, getAuthToken: async () => "token" };
  const add = new MutationObserver(
    queryClient,
    addActivitiesMutationOptions(context)
  );
  const removeAll = new MutationObserver(
    queryClient,
    deleteAllActivitiesMutationOptions(context)
  );
  const rename = new MutationObserver(
    queryClient,
    renameActivityMutationOptions(context)
  );

  expectTypeOf(add.getCurrentResult().mutate)
    .parameter(0)
    .toEqualTypeOf<ActivityRecordServer[]>();
  expectTypeOf(removeAll.getCurrentResult().mutate).toBeCallableWith();
  expectTypeOf(rename.getCurrentResult().mutate)
    .parameter(0)
    .toEqualTypeOf<
      { oldName: string; newName: string } & (
        | { merge?: false; targetCategoryId?: never }
        | { merge: true; targetCategoryId: string }
      )
    >();
  queryClient.clear();
});
