import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./apiClient";

describe("apiFetch", () => {
  const getAuthToken = async () => "test-token";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFetch = (response: Response) =>
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

  it("injects the x-auth-token header from getAuthToken", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 200 }));

    await apiFetch(getAuthToken, "/api/activities");

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("x-auth-token")).toBe("test-token");
  });

  it("preserves caller headers and init while still setting the auth token", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 200 }));

    await apiFetch(getAuthToken, "/api/activities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-auth-token")).toBe("test-token");
    expect(init?.method).toBe("PUT");
  });

  it("throws on a non-ok response by default", async () => {
    mockFetch(new Response(null, { status: 500 }));

    await expect(apiFetch(getAuthToken, "/api/activities")).rejects.toThrow(
      "HTTP error! status: 500"
    );
  });

  it("preserves the HTTP status for route-level session-expired handling", async () => {
    mockFetch(new Response(null, { status: 401 }));
    await expect(
      apiFetch(getAuthToken, "/api/activities")
    ).rejects.toMatchObject({
      status: 401,
      message: "HTTP error! status: 401",
    });
  });

  it("returns the response without throwing when allowNotOk is set (preferences default-on-error path)", async () => {
    mockFetch(new Response(null, { status: 404 }));

    const response = await apiFetch(getAuthToken, "/api/preferences", {
      allowNotOk: true,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });
});
