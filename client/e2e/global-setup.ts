import { chromium } from "@playwright/test";

/**
 * Warm up the MSW service worker before any tests run.
 * This absorbs the cold-start cost (Vite compilation + service worker install)
 * so individual tests don't flake from slow first-load times on CI.
 */
export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/welcome");
  await page.waitForSelector("[data-msw-ready]", { timeout: 60_000 });
  await page.waitForSelector('[data-slot="sidebar"]', { timeout: 30_000 });

  await browser.close();
}
