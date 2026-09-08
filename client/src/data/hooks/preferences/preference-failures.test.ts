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
const changed = {
  groupByCategory: true,
  funAnimations: false,
  isLightTheme: true,
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const getAuthToken = async () => "account-a";
  queryClient.setQueryData(["preferences"], initial);
  const query = new QueryObserver(
    queryClient,
    preferencesQueryOptions(getAuthToken)
  );
  const values: unknown[] = [];
  const stop = query.subscribe((result) => {
    values.push(result.data);
  });
  const mutation = new MutationObserver(
    queryClient,
    updatePreferencesMutationOptions({ queryClient, getAuthToken })
  );
  return {
    queryClient,
    query,
    values,
    mutation,
    dispose: () => {
      stop();
      queryClient.clear();
    },
  };
}

it("rolls back a rejected preference update and refreshes without replaying its PUT", async () => {
  const app = setup();
  const fetch = vi.fn(async (_url, init) =>
    init.method === "PUT"
      ? new Response(null, { status: 403 })
      : Response.json(initial)
  );
  vi.stubGlobal("fetch", fetch);
  try {
    await expect(app.mutation.mutate(changed)).rejects.toMatchObject({
      status: 403,
    });
    expect(app.values).toContainEqual(changed);
    expect(app.query.getCurrentResult().data).toEqual(initial);
    expect(app.mutation.getCurrentResult().isError).toBe(true);
    expect(fetch.mock.calls.map(([, init]) => init.method ?? "GET")).toEqual([
      "PUT",
      "GET",
    ]);
  } finally {
    app.dispose();
  }
});

it.each(["network", "server"])(
  "reconciles possibly committed preferences after a lost %s acknowledgement",
  async (failure) => {
    const app = setup();
    const fetch = vi.fn(async (_url, init) => {
      if (init.method !== "PUT") return Response.json(changed);
      if (failure === "network") throw new TypeError("Response lost");
      return new Response(null, { status: 500 });
    });
    vi.stubGlobal("fetch", fetch);
    try {
      await expect(app.mutation.mutate(changed)).rejects.toThrow(
        failure === "network" ? "Response lost" : "status: 500"
      );
      expect(app.query.getCurrentResult().data).toEqual(changed);
      expect(app.mutation.getCurrentResult().isError).toBe(true);
      expect(fetch.mock.calls.map(([, init]) => init.method ?? "GET")).toEqual([
        "PUT",
        "GET",
      ]);
    } finally {
      app.dispose();
    }
  }
);

it("does not call an acknowledged preference write a failure when only its refresh fails", async () => {
  const app = setup();
  const fetch = vi.fn(
    async (_url, init) =>
      new Response(null, { status: init.method === "PUT" ? 200 : 502 })
  );
  vi.stubGlobal("fetch", fetch);
  try {
    await expect(app.mutation.mutate(changed)).resolves.toBeUndefined();
    expect(app.mutation.getCurrentResult().isSuccess).toBe(true);
    expect(app.query.getCurrentResult().data).toEqual(changed);
    expect(app.query.getCurrentResult().error?.message).toContain(
      "status: 502"
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  } finally {
    app.dispose();
  }
});

it("reconciles an unmounted control's write without invoking its UI callback", async () => {
  const app = setup();
  let finish!: (response: Response) => void;
  const pending = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  const fetch = vi.fn((_url, init) =>
    init.method === "PUT" ? pending : Promise.resolve(Response.json(changed))
  );
  vi.stubGlobal("fetch", fetch);
  const feedback = vi.fn();
  const unmount = app.mutation.subscribe(() => {});
  try {
    const operation = app.mutation.mutate(changed, { onSuccess: feedback });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    unmount();
    finish(new Response(null, { status: 200 }));
    await operation;
    expect(app.query.getCurrentResult().data).toEqual(changed);
    expect(app.queryClient.getQueryState(["preferences"])?.isInvalidated).toBe(
      false
    );
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(feedback).not.toHaveBeenCalled();
  } finally {
    unmount();
    app.dispose();
  }
});
