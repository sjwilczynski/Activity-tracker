import { delay, http, HttpResponse } from "msw";
import type {
  ActivityRecordServer,
  ActivityRecordWithIdServer,
} from "../../data/types";
import { createMockActivity, mockActivities } from "../data/activities";
import { mockCategories } from "../data/categories";

let activities = [...mockActivities];

export const activityHandlers = [
  // GET */api/export
  http.get("*/api/export", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const activitiesMap: Record<string, ActivityRecordServer> = {};
    for (const activity of activities) {
      const { id, ...rest } = activity;
      activitiesMap[id] = rest;
    }

    const categoriesMap: Record<
      string,
      Omit<(typeof mockCategories)[0], "id">
    > = {};
    for (const category of mockCategories) {
      const { id, ...rest } = category;
      categoriesMap[id] = rest;
    }

    return HttpResponse.json({
      activities: activitiesMap,
      categories: categoriesMap,
      preferences: {
        groupByCategory: true,
        funAnimations: true,
        isLightTheme: true,
      },
    });
  }),

  // GET */api/activities
  http.get("*/api/activities", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    if (limit) {
      return HttpResponse.json(activities.slice(0, parseInt(limit)));
    }
    return HttpResponse.json(activities);
  }),

  // POST */api/activities
  http.post("*/api/activities", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const newActivities = (await request.json()) as ActivityRecordServer[];
    const createdActivities: ActivityRecordWithIdServer[] = newActivities.map(
      (activity) => createMockActivity({ ...activity })
    );
    activities = [...createdActivities, ...activities];
    return new HttpResponse(null, { status: 200 });
  }),

  // PUT */api/activities/:id
  http.put("*/api/activities/:id", async ({ params, request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const { id } = params;
    const update = (await request.json()) as ActivityRecordServer;
    const index = activities.findIndex((a) => a.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    activities[index] = { ...activities[index], ...update };
    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE */api/activities/:id
  http.delete("*/api/activities/:id", async ({ params, request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const { id } = params;
    activities = activities.filter((a) => a.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE */api/activities (delete all)
  http.delete("*/api/activities", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    activities = [];
    return new HttpResponse(null, { status: 204 });
  }),
];

// Error scenario handlers for testing
export const activityErrorHandlers = {
  networkError: http.get("*/api/activities", () => {
    return HttpResponse.error();
  }),
  serverError: http.get("*/api/activities", () => {
    return new HttpResponse(null, { status: 500 });
  }),
  unauthorized: http.get("*/api/activities", () => {
    return new HttpResponse(null, { status: 401 });
  }),
};

// Reset activities to initial state (useful between tests)
export const resetActivities = () => {
  activities = [...mockActivities];
};
