import { describe, it, expect, vi, beforeEach } from "vitest";
import { RATE_LIMIT } from "../validation/constants";

// Mock Firebase - factory must be inline
vi.mock("../firebase/firebase", () => {
  const mockTransaction = vi.fn();
  const mockRef = vi.fn(() => ({ transaction: mockTransaction }));
  return {
    database: {
      ref: mockRef,
      __mockRef: mockRef,
      __mockTransaction: mockTransaction,
    },
  };
});

// Import after mocking
import { checkRateLimit, getRateLimitHeaders } from "./rateLimiter";
import { database } from "../firebase/firebase";

// Access mocks through the database object
const mockRef = (database as unknown as { __mockRef: ReturnType<typeof vi.fn> })
  .__mockRef;
const mockTransaction = (
  database as unknown as { __mockTransaction: ReturnType<typeof vi.fn> }
).__mockTransaction;

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows first request (no existing data)", async () => {
    mockTransaction.mockImplementation((callback: (data: null) => unknown) => {
      const result = callback(null);
      return Promise.resolve({
        snapshot: { val: () => result },
      });
    });

    const result = await checkRateLimit("user123");

    expect(result).toEqual({ allowed: true });
    expect(mockRef).toHaveBeenCalledWith("/rateLimit/user123");
  });

  it("allows request within limit", async () => {
    const now = Date.now();
    mockTransaction.mockImplementation(
      (callback: (data: { count: number; windowStart: number }) => unknown) => {
        const result = callback({ count: 30, windowStart: now - 10000 });
        return Promise.resolve({
          snapshot: { val: () => result },
        });
      }
    );

    const result = await checkRateLimit("user123");

    expect(result).toEqual({ allowed: true });
  });

  it("allows request at exactly the limit", async () => {
    const now = Date.now();
    mockTransaction.mockImplementation(
      (callback: (data: { count: number; windowStart: number }) => unknown) => {
        const result = callback({
          count: RATE_LIMIT.REQUESTS_PER_MINUTE - 1,
          windowStart: now - 10000,
        });
        return Promise.resolve({
          snapshot: { val: () => result },
        });
      }
    );

    const result = await checkRateLimit("user123");

    expect(result).toEqual({ allowed: true });
  });

  it("blocks request exceeding limit", async () => {
    const now = Date.now();
    const windowStart = now - 30000; // 30 seconds ago

    mockTransaction.mockImplementation(() => {
      return Promise.resolve({
        snapshot: {
          val: () => ({
            count: RATE_LIMIT.REQUESTS_PER_MINUTE + 1,
            windowStart,
          }),
        },
      });
    });

    const result = await checkRateLimit("user123");

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(RATE_LIMIT.WINDOW_MS);
    }
  });

  it("resets window after expiry", async () => {
    const now = Date.now();
    const expiredWindowStart = now - RATE_LIMIT.WINDOW_MS - 1000;

    mockTransaction.mockImplementation(
      (callback: (data: { count: number; windowStart: number }) => unknown) => {
        const result = callback({
          count: 100,
          windowStart: expiredWindowStart,
        });
        return Promise.resolve({
          snapshot: { val: () => result },
        });
      }
    );

    const result = await checkRateLimit("user123");

    expect(result).toEqual({ allowed: true });
  });

  it("handles different user IDs separately", async () => {
    mockTransaction.mockImplementation((callback: (data: null) => unknown) => {
      const result = callback(null);
      return Promise.resolve({
        snapshot: { val: () => result },
      });
    });

    await checkRateLimit("user1");
    await checkRateLimit("user2");

    expect(mockRef).toHaveBeenCalledWith("/rateLimit/user1");
    expect(mockRef).toHaveBeenCalledWith("/rateLimit/user2");
  });
});

describe("getRateLimitHeaders", () => {
  it("returns empty headers when allowed", () => {
    const headers = getRateLimitHeaders({ allowed: true });
    expect(headers).toEqual({});
  });

  it("returns Retry-After header when blocked", () => {
    const headers = getRateLimitHeaders({
      allowed: false,
      retryAfterMs: 30000,
    });
    expect(headers).toEqual({ "Retry-After": "30" });
  });

  it("rounds Retry-After to ceiling", () => {
    const headers = getRateLimitHeaders({
      allowed: false,
      retryAfterMs: 15500,
    });
    expect(headers).toEqual({ "Retry-After": "16" });
  });

  it("handles small retry time", () => {
    const headers = getRateLimitHeaders({ allowed: false, retryAfterMs: 1000 });
    expect(headers).toEqual({ "Retry-After": "1" });
  });
});
