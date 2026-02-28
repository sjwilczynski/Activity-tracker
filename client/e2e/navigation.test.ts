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
