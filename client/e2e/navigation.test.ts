import { expect, test } from "@playwright/test";
import { mockApi } from "./mock-api";

test.describe("Full app navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls at the browser level (no service worker needed)
    await mockApi(page);
    await page.goto("/welcome", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-slot="sidebar"]', { timeout: 15_000 });
  });

  test("shows dashboard with stats and recent activities", async ({ page }) => {
    await expect(page.getByText(/welcome/i).first()).toBeVisible();
    await expect(page.getByText("Total Activities")).toBeVisible();
    await expect(page.getByText("Last 7 Days")).toBeVisible();
    await expect(page.getByText("Recent Activities")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /log activity/i })
    ).toBeVisible();
  });

  test("navigates to Charts and shows analytics", async ({ page }) => {
    await page.getByRole("link", { name: /charts/i }).click();
    await expect(page.getByText("Activity Analytics")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Total Activities")).toBeVisible();
    await expect(page.getByText("Activity Frequency")).toBeVisible();
    await expect(page.getByText("Activity Distribution")).toBeVisible();
  });

  test("navigates to Activity List and shows entries", async ({ page }) => {
    await page.getByRole("link", { name: /activity list/i }).click();
    await expect(page.getByText("Activity List")).toBeVisible();
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /all time/i })).toBeVisible();
  });

  test("navigates to Settings and shows tabs", async ({ page }) => {
    await page.getByRole("link", { name: /settings/i }).click();
    await expect(
      page.getByRole("heading", { name: /settings/i })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /categories/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /activity names/i })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /appearance/i })).toBeVisible();
  });

  test("navigates to Compare and shows period selector", async ({ page }) => {
    await page.getByRole("link", { name: /compare/i }).click();
    await expect(page.getByText("Compare Periods")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("No periods selected")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add period/i })
    ).toBeVisible();
  });

  test("preserves shared date and comparison filters through navigation and reload", async ({
    page,
  }) => {
    await page.goto(
      "/compare?startDate=2024-01-01&endDate=2024-12-31&periods=year-2024%2Cyear-2023"
    );
    await expect(page.getByText("Activity Comparison")).toBeVisible();
    await page.getByRole("link", { name: /charts/i }).click();
    await expect(page.getByText("Activity Analytics")).toBeVisible();
    const chartsUrl = new URL(page.url());
    expect(chartsUrl.searchParams.get("startDate")).toBe("2024-01-01");
    expect(chartsUrl.searchParams.get("periods")).toBe("year-2024,year-2023");
    await page.goBack();
    await expect(page.getByText("Activity Comparison")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Activity Comparison")).toBeVisible();
    expect(new URL(page.url()).searchParams.get("endDate")).toBe("2024-12-31");
  });

  test("shows an explicit not-found page for an unknown URL", async ({
    page,
  }) => {
    await page.goto("/does-not-exist");
    await expect(
      page.getByRole("heading", { name: /page not found/i })
    ).toBeVisible();
  });

  test("normalizes numeric and repeated comparison parameters without crashing", async ({
    page,
  }) => {
    await page.goto("/compare?periods=123");
    await expect(page.getByText("No periods selected")).toBeVisible();
    await page.goto("/compare?periods=year-2024&periods=year-2023");
    await expect(page.getByText("Activity Comparison")).toBeVisible();
    await expect(page.getByText("2024", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Something Went Wrong")).not.toBeVisible();
  });

  test("same-account profile updates reach the sidebar without refetching history", async ({
    page,
  }) => {
    await expect(page.getByText("Recent Activities")).toBeVisible();
    const activityReads: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/activities"))
        activityReads.push(request.url());
    });

    await page.evaluate(() => window.__e2eAuth.updateProfile("Updated User"));
    await expect(page.getByText("Updated User", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: /compare/i }).click();
    await expect(page.getByText("Compare Periods")).toBeVisible();
    expect(activityReads).toEqual([]);
  });

  test("session-expired recovery signs out before returning to the login form", async ({
    page,
  }) => {
    await page.route("**/api/activities*", (route) =>
      route.fulfill({ status: 401 })
    );
    await page.goto("/activity-list?startDate=2024-01-01");
    await expect(
      page.getByRole("heading", { name: "Session Expired" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
      "/activity-list?startDate=2024-01-01"
    );
  });

  test("guards a signed-out deep link and restores its search after login", async ({
    page,
  }) => {
    await page.evaluate(() => localStorage.setItem("e2e-signed-out", "true"));
    const privateReads: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/")) privateReads.push(request.url());
    });
    await page.goto("/compare?periods=year-2024%2Cyear-2023#comparison");
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    expect(privateReads).toEqual([]);
    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
      "/compare?periods=year-2024%2Cyear-2023#comparison"
    );
    await page.getByRole("button", { name: /sign in with google/i }).click();
    await expect(page.getByText("Activity Comparison")).toBeVisible();
    expect(new URL(page.url()).searchParams.get("periods")).toBe(
      "year-2024,year-2023"
    );
  });

  test("sign-out removes private content and login works again", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    await expect(page.getByText("Recent Activities")).not.toBeVisible();
    await page.getByRole("button", { name: /sign in with google/i }).click();
    await expect(page.getByText("Recent Activities")).toBeVisible();
  });

  test("updates the sidebar when crossing the mobile breakpoint", async ({
    page,
  }) => {
    const toggle = page.getByRole("button", { name: "Toggle Sidebar" });
    const drawer = page.getByRole("dialog");

    await page.setViewportSize({ width: 767, height: 900 });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: /charts/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();

    await page.setViewportSize({ width: 768, height: 900 });
    await expect(toggle).not.toBeVisible();
    await expect(page.getByRole("link", { name: /charts/i })).toBeVisible();

    await page.setViewportSize({ width: 767, height: 900 });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(drawer).toBeVisible();
  });

  test("full navigation cycle through all pages", async ({ page }) => {
    // Dashboard
    await expect(page.getByText("Total Activities")).toBeVisible();

    // Charts
    await page.getByRole("link", { name: /charts/i }).click();
    await expect(page.getByText("Activity Analytics")).toBeVisible();

    // Activity List
    await page.getByRole("link", { name: /activity list/i }).click();
    await expect(page.getByText("Activity List")).toBeVisible();

    // Compare
    await page.getByRole("link", { name: /compare/i }).click();
    await expect(page.getByText("Compare Periods")).toBeVisible({
      timeout: 10_000,
    });

    // Settings
    await page.getByRole("link", { name: /settings/i }).click();
    await expect(
      page.getByRole("heading", { name: /settings/i })
    ).toBeVisible();

    // Back to Dashboard
    await page.getByRole("link", { name: /dashboard/i }).click();
    await expect(page.getByText("Recent Activities")).toBeVisible();
  });
});
