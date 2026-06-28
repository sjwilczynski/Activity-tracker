import type { HttpRequest } from "@azure/functions";
import { beforeEach, describe, expect, it, vi } from "vitest";

// These modules transitively import firebase/firebase.ts, which calls
// initializeApp() at load time and would crash without real credentials, so
// they must be stubbed. firebase/firebase is also mocked directly so the test
// stays safe if index.ts (or a helper) ever imports it directly.
// validateCategory is pure and is intentionally NOT mocked — the test
// exercises the real validation path with valid data.
vi.mock("@azure/functions", () => ({
  app: { http: vi.fn() },
}));

vi.mock("../../firebase/firebase", () => ({
  auth: { verifyIdToken: vi.fn() },
  database: { ref: vi.fn() },
}));

vi.mock("../../authorization/firebaseAuthorization", () => ({
  getUserId: vi.fn(async () => "user-1"),
}));

vi.mock("../../rateLimit/rateLimiter", () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

const { addCategory: addCategoryDb, getCategoryCount } = vi.hoisted(() => ({
  addCategory: vi.fn(),
  getCategoryCount: vi.fn(async () => 0),
}));

vi.mock("../../database/firebaseDB", () => ({
  firebaseDB: {
    getCategoryCount,
    addCategory: addCategoryDb,
  },
}));

import { addCategory } from "./index";

const validCategory = {
  name: "Sports",
  description: "Physical activities",
  active: true,
  activityNames: ["Running"],
};

function makeRequest(): HttpRequest {
  return {
    json: async () => validCategory,
    headers: {
      get: (name: string) => (name === "x-auth-token" ? "valid-token" : null),
    },
  } as unknown as HttpRequest;
}

describe("addCategory error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCategoryCount.mockResolvedValue(0);
  });

  it("returns a generic 500 body without leaking the internal error message", async () => {
    const internalMessage =
      "Firebase connection string: postgres://admin:super-secret@db";
    addCategoryDb.mockRejectedValueOnce(new Error(internalMessage));

    const response = await addCategory(makeRequest());

    expect(response.status).toBe(500);
    expect(response.body).toBe("Internal server error");
    expect(response.body).not.toContain(internalMessage);
  });
});
