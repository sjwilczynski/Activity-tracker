import { delay, http, HttpResponse } from "msw";
import type { UserPreferences } from "../../data/types";

const defaultPreferences: UserPreferences = {
  groupByCategory: true,
  funAnimations: true,
  isLightTheme: true,
};

const darkPreferences: UserPreferences = {
  ...defaultPreferences,
  isLightTheme: false,
};

let preferences = { ...defaultPreferences };
export const getPreferences = () => preferences;
export const setPreferences = (value: UserPreferences) => {
  preferences = value;
};
export const resetPreferences = () => {
  preferences = { ...defaultPreferences };
};

export const preferencesHandlers = [
  http.get("*/api/preferences", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json(preferences);
  }),

  http.put("*/api/preferences", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    preferences = (await request.json()) as UserPreferences;
    return new HttpResponse(null, { status: 204 });
  }),
];

export const darkPreferencesHandler = http.get(
  "*/api/preferences",
  async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json(darkPreferences);
  }
);
