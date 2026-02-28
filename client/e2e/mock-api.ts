import type { Page } from "@playwright/test";
import { mockActivities } from "../src/mocks/data/activities";
import { mockCategories } from "../src/mocks/data/categories";

const preferences = {
  groupByCategory: true,
  funAnimations: true,
  isLightTheme: true,
};

/**
 * Set up Playwright route interception for all API endpoints.
 * Uses the same mock data as Storybook MSW handlers.
 */
export async function mockApi(page: Page) {
  await page.route("**/api/activities*", (route) => {
    if (route.request().method() === "GET") {
      const url = new URL(route.request().url());
      const limit = url.searchParams.get("limit");
      const data = limit
        ? mockActivities.slice(0, Number(limit))
        : mockActivities;
      return route.fulfill({ json: data });
    }
    return route.fulfill({ status: 200, json: {} });
  });

  await page.route("**/api/categories*", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ json: mockCategories });
    }
    return route.fulfill({ status: 200, json: {} });
  });

  await page.route("**/api/preferences*", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ json: preferences });
    }
    return route.fulfill({ status: 204 });
  });

  await page.route("**/api/export*", (route) => {
    const activitiesMap: Record<string, unknown> = {};
    for (const a of mockActivities) {
      const { id, ...rest } = a;
      activitiesMap[id] = rest;
    }
    const categoriesMap: Record<string, unknown> = {};
    for (const c of mockCategories) {
      const { id, ...rest } = c;
      categoriesMap[id] = rest;
    }
    return route.fulfill({
      json: { activities: activitiesMap, categories: categoriesMap },
    });
  });
}
