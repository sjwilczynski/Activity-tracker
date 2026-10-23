import {
  MutationObserver,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { preferencesQueryOptions } from "../../queryOptions";
import type { UserPreferences } from "../../types";
import { updatePreferencesMutationOptions } from "./preference-mutations";

afterEach(() => vi.unstubAllGlobals());

const initial = {
  groupByCategory: true,
  funAnimations: true,
  isLightTheme: true,
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const getAuthToken = async () => "account-a";
  let persisted = initial;
  const writes: {
    preferences: UserPreferences;
    resolve: (response: Response) => void;
  }[] = [];
  const fetch = vi.fn((_url, init) => {
    if (init.method === "PUT") {
      return new Promise<Response>((resolve) => {
        writes.push({ preferences: JSON.parse(init.body), resolve });
      });
    }
    return Promise.resolve(Response.json(persisted));
  });
  vi.stubGlobal("fetch", fetch);
  queryClient.setQueryData(["preferences"], initial);
  const query = new QueryObserver(
    queryClient,
    preferencesQueryOptions(getAuthToken)
  );
  const stop = query.subscribe(() => {});
  return {
    query,
    queryClient,
    writes,
    fetch,
    mutation: () =>
      new MutationObserver(
        queryClient,
        updatePreferencesMutationOptions({ queryClient, getAuthToken })
      ),
    finish(index: number, status: number) {
      if (status === 200) persisted = writes[index].preferences;
      writes[index].resolve(new Response(null, { status }));
    },
    dispose() {
      stop();
      queryClient.clear();
    },
  };
}

it("a rejected earlier toggle cannot undo a later toggle still being saved by another hook", async () => {
  const app = setup();
  try {
    const first = app
      .mutation()
      .mutate({ ...initial, groupByCategory: false })
      .catch((error: unknown) => error);
    await vi.waitFor(() => expect(app.writes).toHaveLength(1));
    const later = {
      ...app.query.getCurrentResult().data!,
      funAnimations: false,
    };
    const second = app.mutation().mutate(later);
    await vi.waitFor(() => expect(app.writes).toHaveLength(2));
    app.finish(0, 403);
    expect(await first).toBeInstanceOf(Error);
    const whileSaving = app.query.getCurrentResult().data;
    app.finish(1, 200);
    await second;
    expect(whileSaving).toEqual({
      groupByCategory: false,
      funAnimations: false,
      isLightTheme: true,
    });
    expect(app.query.getCurrentResult().data).toEqual(later);
  } finally {
    app.dispose();
  }
});

const earlier = {
  groupByCategory: false,
  funAnimations: true,
  isLightTheme: true,
};
const later = {
  groupByCategory: false,
  funAnimations: false,
  isLightTheme: true,
};

it.each([
  {
    first: 0,
    firstStatus: 200,
    finalStatus: 403,
    interim: later,
    final: earlier,
  },
  {
    first: 1,
    firstStatus: 403,
    finalStatus: 200,
    interim: earlier,
    final: earlier,
  },
  {
    first: 1,
    firstStatus: 200,
    finalStatus: 403,
    interim: later,
    final: later,
  },
  {
    first: 0,
    firstStatus: 403,
    finalStatus: 403,
    interim: later,
    final: initial,
  },
  {
    first: 1,
    firstStatus: 403,
    finalStatus: 403,
    interim: earlier,
    final: initial,
  },
])(
  "preserves valid optimism and reconciles once when request $first settles with $firstStatus",
  async (scenario) => {
    const app = setup();
    try {
      const first = app
        .mutation()
        .mutate(earlier)
        .catch((error: unknown) => error);
      await vi.waitFor(() => expect(app.writes).toHaveLength(1));
      const second = app
        .mutation()
        .mutate(later)
        .catch((error: unknown) => error);
      await vi.waitFor(() => expect(app.writes).toHaveLength(2));
      const operations = [first, second];
      app.finish(scenario.first, scenario.firstStatus);
      const completed = await operations[scenario.first];
      if (scenario.firstStatus !== 200) expect(completed).toBeInstanceOf(Error);
      const beforeFinal = app.query.getCurrentResult().data;
      const readsBeforeFinal = app.fetch.mock.calls.filter(
        ([, init]) => init.method !== "PUT"
      ).length;
      app.finish(1 - scenario.first, scenario.finalStatus);
      const finalResult = await operations[1 - scenario.first];
      if (scenario.finalStatus !== 200)
        expect(finalResult).toBeInstanceOf(Error);
      expect(beforeFinal).toEqual(scenario.interim);
      expect(readsBeforeFinal).toBe(0);
      expect(app.query.getCurrentResult().data).toEqual(scenario.final);
      expect(
        app.fetch.mock.calls.filter(([, init]) => init.method !== "PUT")
      ).toHaveLength(1);
    } finally {
      app.dispose();
    }
  }
);
