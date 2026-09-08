import {
  MutationObserver,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { preferencesQueryOptions } from "../../queryOptions";
import { updatePreferencesMutationOptions } from "./preference-mutations";

afterEach(() => vi.unstubAllGlobals());

const initial = {
  groupByCategory: true,
  funAnimations: true,
  isLightTheme: true,
};

it("removes an uncommitted optimistic value if retirement occurs before the auth check", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(["preferences"], initial);
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const mutation = new MutationObserver(
    queryClient,
    updatePreferencesMutationOptions({
      queryClient,
      getAuthToken: async () => {
        throw new Error("Session retired");
      },
    })
  );
  try {
    const operation = mutation.mutate({ ...initial, isLightTheme: false });
    queryClient.clear();
    await expect(operation).rejects.toThrow("Session retired");
    expect(fetch).not.toHaveBeenCalled();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  } finally {
    queryClient.clear();
  }
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it("updates preferences immediately and reconciles only preferences before reporting success", async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const getAuthToken = async () => "account-a";
  const write = deferred<Response>();
  const read = deferred<Response>();
  const next = {
    groupByCategory: false,
    funAnimations: true,
    isLightTheme: true,
  };
  queryClient.setQueryData(["preferences"], initial);
  queryClient.setQueryData(["unrelated"], "unchanged");
  const query = new QueryObserver(
    queryClient,
    preferencesQueryOptions(getAuthToken)
  );
  const stop = query.subscribe(() => {});
  const fetch = vi.fn((_url, init) =>
    init.method === "PUT" ? write.promise : read.promise
  );
  vi.stubGlobal("fetch", fetch);
  const mutation = new MutationObserver(
    queryClient,
    updatePreferencesMutationOptions({ queryClient, getAuthToken })
  );
  try {
    const operation = mutation.mutate(next);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(query.getCurrentResult().data).toEqual(next);
    expect(mutation.getCurrentResult().isPending).toBe(true);
    const [, request] = fetch.mock.calls[0];
    expect(new Headers(request.headers).get("x-auth-token")).toBe("account-a");
    expect(JSON.parse(request.body)).toEqual(next);
    write.resolve(new Response(null, { status: 200 }));
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(mutation.getCurrentResult().isPending).toBe(true);
    read.resolve(Response.json(next));
    await expect(operation).resolves.toBeUndefined();
    expect(mutation.getCurrentResult().isSuccess).toBe(true);
    expect(query.getCurrentResult().data).toEqual(next);
    expect(queryClient.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
  } finally {
    stop();
    queryClient.clear();
  }
});

it.each([200, 500])(
  "retired-session completion (%s) cannot resurrect its cache or touch the next account",
  async (status) => {
    const queryClient = new QueryClient();
    const nextAccount = new QueryClient();
    const write = deferred<Response>();
    const fetch = vi.fn(() => write.promise);
    vi.stubGlobal("fetch", fetch);
    queryClient.setQueryData(["preferences"], initial);
    const nextPreferences = {
      groupByCategory: false,
      funAnimations: false,
      isLightTheme: false,
    };
    nextAccount.setQueryData(["preferences"], nextPreferences);
    const mutation = new MutationObserver(
      queryClient,
      updatePreferencesMutationOptions({
        queryClient,
        getAuthToken: async () => "retired-account",
      })
    );
    const feedback = vi.fn();
    const unmount = mutation.subscribe(() => {});
    try {
      const operation = mutation.mutate(
        { ...initial, funAnimations: false },
        { onError: feedback }
      );
      await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
      unmount();
      queryClient.clear();
      write.resolve(new Response(null, { status }));
      if (status === 200) await expect(operation).resolves.toBeUndefined();
      else await expect(operation).rejects.toThrow("status: 500");
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
      expect(nextAccount.getQueryData(["preferences"])).toEqual(
        nextPreferences
      );
      expect(nextAccount.getQueryState(["preferences"])?.isInvalidated).toBe(
        false
      );
      expect(feedback).not.toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledOnce();
    } finally {
      unmount();
      queryClient.clear();
      nextAccount.clear();
    }
  }
);
