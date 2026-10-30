import { expect, test } from "@playwright/test";
import { mockApi } from "./mock-api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("ships native charts without prototype controls or the old renderer", async ({
  page,
}) => {
  await page.goto("/charts");
  await expect(
    page.getByRole("img", { name: "Activity frequency" })
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Activity distribution" })
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Chart prototype variants" })
  ).toHaveCount(0);
  await expect(page.getByLabel("Scenario", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.getByText(/^View exact/)).toHaveCount(0);
  await expect(page.getByText(/^Keyboard:/)).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: "Activity comparison" })
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Group by category", exact: true })
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Hide Running", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Show Running", exact: true })
  ).toHaveAttribute("aria-pressed", "false");
});

test("supports a large legend, keyboard values, and mobile access", async ({
  page,
}) => {
  const categories = [
    {
      id: "many",
      name: "Many activities",
      description: "",
      active: true,
      activityNames: Array.from(
        { length: 30 },
        (_, index) => `Activity ${index + 1}`
      ),
    },
  ];
  const records = categories[0].activityNames.map((name, index) => ({
    id: String(index),
    name,
    categoryId: "many",
    active: true,
    date: "2025-01-15",
  }));
  await page.route("**/api/activities*", (route) =>
    route.fulfill({ json: records })
  );
  await page.route("**/api/categories*", (route) =>
    route.fulfill({ json: categories })
  );
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/charts");
  const legend = page.getByRole("group", {
    name: "Activity distribution legend",
    exact: true,
  });
  await expect(legend.getByRole("button")).toHaveCount(30);
  const chart = page.getByRole("img", {
    name: "Activity frequency",
    exact: true,
  });
  await chart.focus();
  await chart.press("ArrowRight");
  await expect(page.getByRole("status")).toContainText(/Activity \d+: 1 entry/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText("Activities legend", { exact: true }).click();
  await page
    .getByRole("button", { name: "Hide Activity 30", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Show Activity 30", exact: true })
  ).toBeVisible();
});

test("marks the current year partial on the actual Compare route", async ({
  page,
}) => {
  const year = new Date().getFullYear();
  await page.goto(`/compare?periods=year-${year},year-${year - 1}`);
  const chart = page.getByRole("img", {
    name: "Activity comparison",
    exact: true,
  });
  await expect(chart).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Hide ${year} (partial)`, exact: true })
  ).toBeVisible();
  await expect(chart).toContainText("Dec");
  await expect(chart).toContainText("0");
  await page
    .getByRole("button", { name: `Hide ${year - 1}`, exact: true })
    .click();
  await expect(chart).toContainText("Dec");
});

test("lets mobile users toggle an activity with a maximum-length name", async ({
  page,
}) => {
  const name = "W".repeat(50);
  await page.route("**/api/activities*", (route) =>
    route.fulfill({
      json: [
        {
          id: "long-name",
          name,
          categoryId: "custom",
          active: true,
          date: "2025-01-15",
        },
      ],
    })
  );
  await page.route("**/api/categories*", (route) =>
    route.fulfill({
      json: [
        {
          id: "custom",
          name: "Custom",
          description: "",
          active: true,
          activityNames: [name],
        },
      ],
    })
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/charts");
  await page.getByText("Activities legend", { exact: true }).click();
  const button = page.getByRole("button", {
    name: `Hide ${name}`,
    exact: true,
  });
  await expect(button).toBeVisible();
  await button.click();
  await expect(
    page.getByRole("button", { name: `Show ${name}`, exact: true })
  ).toHaveAttribute("aria-pressed", "false");
});
