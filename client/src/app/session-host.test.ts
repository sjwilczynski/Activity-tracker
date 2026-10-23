import { createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionHost } from "./session-host";
import { createTestAuth, requestUrl, testUser } from "./test-auth";

describe("session host authentication boundary", { timeout: 15_000 }, () => {
  const fetchMock = vi.fn<typeof fetch>();
  const stops: Array<() => void> = [];
  beforeEach(() => {
    vi.stubGlobal("window", { location: { origin: "https://example.test" } });
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset().mockImplementation(async () => Response.json([]));
  });
  afterEach(() => {
    stops.splice(0).forEach((stop) => stop());
    vi.unstubAllGlobals();
  });
  it("does not create private queries before delayed auth initialization", async () => {
    const { auth, setUser } = createTestAuth(null, true);
    const host = createSessionHost(
      auth,
      createMemoryHistory({ initialEntries: ["/activity-list"] })
    );
    stops.push(host.start());
    expect(host.getSnapshot().runtime).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    setUser(testUser);
    await vi.waitFor(() => expect(host.getSnapshot().runtime).not.toBeNull());
    await host.getSnapshot().runtime!.router.load();
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        requestUrl(url).includes("/activities")
      )
    ).toHaveLength(1);
  });

  it("redirects a signed-out deep link without private requests and preserves the full destination", async () => {
    const { auth } = createTestAuth(null);
    const history = createMemoryHistory({
      initialEntries: ["/activity-list?startDate=2026-09-01#entry"],
    });
    const host = createSessionHost(auth, history);
    stops.push(host.start());
    await vi.waitFor(() => expect(host.getSnapshot().runtime).not.toBeNull());
    await host.getSnapshot().runtime!.router.load();
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(history.location.pathname).toBe("/login"));
    expect(new URLSearchParams(history.location.search).get("returnTo")).toBe(
      "/activity-list?startDate=2026-09-01#entry"
    );
  });

  it("retires old caches and tokens on account switch without losing the current URL", async () => {
    const { auth, setUser } = createTestAuth();
    const history = createMemoryHistory({
      initialEntries: ["/compare?periods=year-2026"],
    });
    const host = createSessionHost(auth, history);
    stops.push(host.start());
    await vi.waitFor(() => expect(host.getSnapshot().runtime).not.toBeNull());
    const alice = host.getSnapshot().runtime!;
    await alice.router.load();
    setUser({ ...testUser, uid: "bob" });
    const bob = host.getSnapshot().runtime!;
    expect(bob).not.toBe(alice);
    expect(alice.session.queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(bob.session.queryClient.getQueryCache().getAll()).toHaveLength(0);
    await expect(alice.session.getAuthToken()).rejects.toThrow(
      "Session retired"
    );
    await expect(bob.session.getAuthToken()).resolves.toBe("bob-token");
    expect(history.location.href).toBe("/compare?periods=year-2026");
  });

  it("keeps the runtime and caches on same-UID token refresh", async () => {
    const { auth, setUser } = createTestAuth();
    const host = createSessionHost(
      auth,
      createMemoryHistory({ initialEntries: ["/compare"] })
    );
    stops.push(host.start());
    await vi.waitFor(() => expect(host.getSnapshot().runtime).not.toBeNull());
    const runtime = host.getSnapshot().runtime!;
    await runtime.router.load();
    setUser({ ...testUser, displayName: "Alice Updated" });
    expect(host.getSnapshot().runtime).toBe(runtime);
    expect(
      runtime.session.queryClient.getQueryCache().getAll().length
    ).toBeGreaterThan(0);
  });

  it("supports StrictMode cleanup and restart without missing a later sign-in", async () => {
    const { auth, setUser, listenerCount } = createTestAuth();
    const history = createMemoryHistory({ initialEntries: ["/settings"] });
    const host = createSessionHost(auth, history);
    const stop = host.start();
    await vi.waitFor(() => expect(host.getSnapshot().runtime).not.toBeNull());
    const previous = host.getSnapshot().runtime!;
    stop();
    expect(listenerCount()).toBe(0);
    setUser({ ...testUser, uid: "bob" });
    stops.push(host.start());
    await vi.waitFor(() =>
      expect(host.getSnapshot().runtime?.session.user?.uid).toBe("bob")
    );
    expect(listenerCount()).toBe(1);
    await expect(previous.session.getAuthToken()).rejects.toThrow(
      "Session retired"
    );
    expect(history.location.pathname).toBe("/settings");
  });

  it.each(["signInWithGoogle", "signInWithEmail", "signUp"] as const)(
    "returns to the full deep link after %s through the injected auth seam",
    async (method) => {
      const { auth } = createTestAuth(null);
      const history = createMemoryHistory({
        initialEntries: [
          "/login?returnTo=%2Fcharts%3FstartDate%3D2026-09-01%23summary",
        ],
      });
      const host = createSessionHost(auth, history);
      stops.push(host.start());
      await vi.waitFor(() => expect(host.getSnapshot().runtime).not.toBeNull());
      const anonymous = host.getSnapshot().runtime!;
      await anonymous.router.load();
      await anonymous.session.authService[method](
        "alice@example.test",
        "password"
      );
      const authenticated = host.getSnapshot().runtime!;
      expect(authenticated).not.toBe(anonymous);
      await authenticated.router.load();
      await vi.waitFor(() => expect(history.location.pathname).toBe("/charts"));
      expect(history.location.search).toBe("?startDate=2026-09-01");
      expect(history.location.hash).toBe("#summary");
    }
  );

  it("replaces a signed-in login visit with a safe local destination", async () => {
    const { auth } = createTestAuth();
    const history = createMemoryHistory({
      initialEntries: ["/login?returnTo=https%3A%2F%2Fevil.test"],
    });
    const host = createSessionHost(auth, history);
    stops.push(host.start());
    await vi.waitFor(() => expect(host.getSnapshot().runtime).not.toBeNull());
    await host.getSnapshot().runtime!.router.load();
    await vi.waitFor(() => expect(history.location.pathname).toBe("/welcome"));
    expect(history.length).toBe(1);
  });
});
