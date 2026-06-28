import type { HttpRequest } from "@azure/functions";
import { beforeEach, describe, expect, it, vi } from "vitest";

// These modules transitively import firebase/firebase.ts, which calls
// initializeApp() at load time and would crash without real credentials, so
// they must be stubbed. validateActivityBatch is pure and is intentionally
// NOT mocked — the test exercises the real validation path with valid data.
vi.mock("@azure/functions", () => ({
  app: { http: vi.fn() },
}));

vi.mock("../../authorization/firebaseAuthorization", () => ({
  getUserId: vi.fn(async () => "user-1"),
}));

vi.mock("../../rateLimit/rateLimiter", () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

const { addActivities, getActivityCount } = vi.hoisted(() => ({
  addActivities: vi.fn(),
  getActivityCount: vi.fn(async () => 0),
}));

vi.mock("../../database/firebaseDB", () => ({
  firebaseDB: {
    getActivityCount,
    addActivities,
  },
}));

import { addActivity } from "./index";

const validActivities = [{ name: "Running", date: "2024-01-01" }];

function makeRequest(): HttpRequest {
  return {
    json: async () => validActivities,
    headers: {
      get: (name: string) => (name === "x-auth-token" ? "valid-token" : null),
    },
  } as unknown as HttpRequest;
}

describe("addActivity error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActivityCount.mockResolvedValue(0);
  });

  it("returns a generic 500 body without leaking the internal error message", async () => {
    const internalMessage =
      "Firebase connection string: postgres://admin:super-secret@db";
    addActivities.mockRejectedValueOnce(new Error(internalMessage));

    const response = await addActivity(makeRequest());

    expect(response.status).toBe(500);
    expect(response.body).toBe("Internal server error");
    expect(response.body).not.toContain(internalMessage);
  });
});
