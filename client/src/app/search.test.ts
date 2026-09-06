import { describe, expect, it } from "vitest";
import { safeReturnTo, validateAppSearch } from "./search";

describe("local return destinations", () => {
  it("keeps an authenticated deep link's query and hash", () => {
    expect(safeReturnTo("/activity-list?startDate=2026-09-01#entry")).toBe(
      "/activity-list?startDate=2026-09-01#entry"
    );
  });
  it.each([
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/login?returnTo=/login",
    "/%6cogin",
    "/%5cevil.test",
    "/missing",
  ])("rejects unsafe or unsupported destination %s", (value) => {
    expect(safeReturnTo(value)).toBe("/welcome");
  });
});

describe("client-side search state", () => {
  it("keeps valid date/period wire formats and unrelated state, dropping malformed values", () => {
    expect(
      validateAppSearch({
        startDate: "2026-09-01",
        endDate: "2026-02-30",
        periods: "month-2026-8,bad,year-2025",
        campaign: "personal",
      })
    ).toEqual({
      startDate: "2026-09-01",
      periods: "month-2026-8,year-2025",
      campaign: "personal",
    });
  });
});
