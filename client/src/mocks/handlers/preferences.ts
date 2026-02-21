import { delay, http, HttpResponse } from "msw";
import type { UserPreferences } from "../../data/types";

const defaultPreferences: UserPreferences = {
  groupByCategory: true,
  funAnimations: true,
  isLightTheme: true,
};

export const preferencesHandlers = [
  http.get("*/api/preferences", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json(defaultPreferences);
  }),

  http.put("*/api/preferences", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
