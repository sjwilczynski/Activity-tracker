import {
  MutationObserver,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addActivitiesMutationOptions } from "./actions";

afterEach(() => vi.unstubAllGlobals());

const records = [{ date: "2026-09-06", name: "Running", categoryId: "sports" }];

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  const mutation = new MutationObserver(
    client,
    addActivitiesMutationOptions({
      queryClient: client,
      getAuthToken: async () => "token",
    })
  );
  return { client, mutation };
}

describe("native mutation lifecycle", () => {
  it("marks inactive limited histories stale without fetching until observed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 200 }))
    );
    const { client, mutation } = setup();
    client.setQueryData(["activitiesWithLimit", 5], []);
    client.setQueryData(["activitiesWithLimit", 20], []);
    const read = vi.fn(async () => []);
    const query = new QueryObserver(client, {
      queryKey: ["activitiesWithLimit", 20],
      queryFn: read,
    });
    await mutation.mutate(records);
    expect(read).not.toHaveBeenCalled();
    expect(
      client.getQueryState(["activitiesWithLimit", 5])?.isInvalidated
    ).toBe(true);
    const stop = query.subscribe(() => {});
    try {
      await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(1));
      expect(
        client.getQueryState(["activitiesWithLimit", 5])?.isInvalidated
      ).toBe(true);
    } finally {
      stop();
      client.clear();
    }
  });

  it("reconciles after unmount but does not deliver mounted-only UI callbacks", async () => {
    const response = deferred<Response>();
    const fetch = vi.fn(() => response.promise);
    vi.stubGlobal("fetch", fetch);
    const { client, mutation } = setup();
    client.setQueryData(["activities"], []);
    const feedback = vi.fn();
    const unmount = mutation.subscribe(() => {});
    const operation = mutation.mutate(records, { onSuccess: feedback });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    unmount();
    response.resolve(new Response(null, { status: 200 }));
    await operation;
    expect(client.getQueryState(["activities"])?.isInvalidated).toBe(true);
    expect(feedback).not.toHaveBeenCalled();
    client.clear();
  });

  it("stays pending through active read reconciliation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 200 }))
    );
    const { client, mutation } = setup();
    client.setQueryData(["activities"], []);
    const response = deferred<never[]>();
    const read = vi.fn(() => response.promise);
    const stop = new QueryObserver(client, {
      queryKey: ["activities"],
      queryFn: read,
    }).subscribe(() => {});
    try {
      const operation = mutation.mutate(records);
      await vi.waitFor(() => expect(read).toHaveBeenCalledOnce());
      expect(mutation.getCurrentResult().isPending).toBe(true);
      response.resolve([]);
      await operation;
      expect(mutation.getCurrentResult().isSuccess).toBe(true);
    } finally {
      stop();
      client.clear();
    }
  });

  it("keeps an acknowledged write successful when its read refresh fails, without replay", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const { client, mutation } = setup();
    client.setQueryData(["activities"], records);
    const readError = new Error("Read unavailable");
    const query = new QueryObserver(client, {
      queryKey: ["activities"],
      queryFn: async () => {
        throw readError;
      },
    });
    const stop = query.subscribe(() => {});
    try {
      await expect(mutation.mutate(records)).resolves.toBeUndefined();
      expect(mutation.getCurrentResult().isSuccess).toBe(true);
      expect(query.getCurrentResult().error).toBe(readError);
      expect(query.getCurrentResult().data).toEqual(records);
      expect(fetch).toHaveBeenCalledOnce();
    } finally {
      stop();
      client.clear();
    }
  });

  it("completion on a retired client cannot refresh the next account's cache or UI", async () => {
    const response = deferred<Response>();
    const fetch = vi.fn(() => response.promise);
    vi.stubGlobal("fetch", fetch);
    const { client, mutation } = setup();
    const nextAccount = new QueryClient();
    nextAccount.setQueryData(["activities"], ["next account"]);
    const feedback = vi.fn();
    const unmount = mutation.subscribe(() => {});
    const operation = mutation.mutate(records, { onSuccess: feedback });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    unmount();
    client.clear();
    response.resolve(new Response(null, { status: 200 }));
    await operation;
    expect(nextAccount.getQueryData(["activities"])).toEqual(["next account"]);
    expect(nextAccount.getQueryState(["activities"])?.isInvalidated).toBe(
      false
    );
    expect(feedback).not.toHaveBeenCalled();
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    nextAccount.clear();
  });

  it("resets completed state for a new edit without deduplicating distinct occurrences", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const { client, mutation } = setup();
    await mutation.mutate(records);
    expect(mutation.getCurrentResult().isSuccess).toBe(true);
    mutation.reset();
    expect(mutation.getCurrentResult().isIdle).toBe(true);
    await mutation.mutate(records);
    expect(fetch).toHaveBeenCalledTimes(2);
    client.clear();
  });
});
