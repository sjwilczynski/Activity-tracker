import type { HttpRequest } from "@azure/functions";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("../../validation/validators", () => ({
  validateActivityBatch: vi.fn(() => ({
    valid: true,
    data: [{ name: "Running", date: "2024-01-01" }],
  })),
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

function makeRequest(): HttpRequest {
  return {
    json: async () => [{ name: "Running", date: "2024-01-01" }],
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
    const secret = "Firebase connection string leaked: super-secret";
    addActivities.mockRejectedValueOnce(new Error(secret));

    const response = await addActivity(makeRequest());

    expect(response.status).toBe(500);
    expect(response.body).toBe("Internal server error");
    expect(response.body).not.toContain("secret");
  });
});
