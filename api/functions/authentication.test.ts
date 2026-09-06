import { HttpRequest } from "@azure/functions";
import { FirebaseAuthError, type Auth } from "firebase-admin/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyIdToken, getUserData, checkRateLimit } = vi.hoisted(() => ({
  verifyIdToken: vi.fn<Auth["verifyIdToken"]>(),
  getUserData: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("../firebase/firebase", () => ({
  auth: { verifyIdToken },
  database: { ref: vi.fn() },
}));

vi.mock("../database/firebaseDB", () => ({
  firebaseDB: { getUserData },
}));

vi.mock("../rateLimit/rateLimiter", () => ({
  checkRateLimit,
  getRateLimitHeaders: vi.fn(),
}));

import { exportData } from "./exportData";

function request(token?: string) {
  return new HttpRequest({
    method: "GET",
    url: "http://localhost/api/export",
    headers: token === undefined ? {} : { "x-auth-token": token },
  });
}

describe("Firebase authentication at the API boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    checkRateLimit.mockResolvedValue({ allowed: true });
  });

  it("rejects a missing token without invoking Firebase or reading data", async () => {
    expect(await exportData(request())).toEqual({
      status: 401,
      body: "Unauthorized",
    });
    expect(verifyIdToken).not.toHaveBeenCalled();
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(getUserData).not.toHaveBeenCalled();
  });

  it.each(["id-token-expired", "invalid-id-token", "id-token-revoked"])(
    "preserves HTTP 401 for Admin 14's %s error",
    async (code) => {
      verifyIdToken.mockRejectedValueOnce(
        new FirebaseAuthError({
          code,
          message: "Private SDK error details",
          cause: new Error("Private verification failure"),
        })
      );

      expect(await exportData(request("rejected-token"))).toEqual({
        status: 401,
        body: "Unauthorized",
      });
      expect(verifyIdToken).toHaveBeenCalledWith("rejected-token");
      expect(checkRateLimit).not.toHaveBeenCalled();
      expect(getUserData).not.toHaveBeenCalled();
    }
  );

  it("scopes an authenticated export to the verified uid", async () => {
    verifyIdToken.mockResolvedValueOnce({
      aud: "test-project",
      auth_time: 1,
      exp: 2,
      iat: 1,
      iss: "https://securetoken.google.com/test-project",
      sub: "verified-user",
      uid: "verified-user",
      firebase: { identities: {}, sign_in_provider: "google.com" },
    });
    const data = { activities: {}, categories: {}, preferences: {} };
    getUserData.mockResolvedValueOnce(data);

    expect(await exportData(request("valid-token"))).toEqual({
      status: 200,
      jsonBody: data,
    });
    expect(verifyIdToken).toHaveBeenCalledWith("valid-token");
    expect(checkRateLimit).toHaveBeenCalledWith("verified-user");
    expect(getUserData).toHaveBeenCalledWith("verified-user");
  });
});
