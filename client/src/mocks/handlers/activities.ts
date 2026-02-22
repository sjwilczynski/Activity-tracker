import { delay, http, HttpResponse } from "msw";
import type {
  ActivityRecordServer,
  ActivityRecordWithIdServer,
} from "../../data/types";
import { createMockActivity, mockActivities } from "../data/activities";
import { getCategories } from "./categories";

let activities = [...mockActivities];

export const getActivities = () => activities;
export const setActivities = (newActivities: ActivityRecordWithIdServer[]) => {
  activities = newActivities;
};

/** Re-derive categoryId + active for all activities based on current categories */
function enrichActivities(
  list: ActivityRecordWithIdServer[]
): ActivityRecordWithIdServer[] {
  const cats = getCategories();
  const nameMap = new Map<string, { categoryId: string; active: boolean }>();
  for (const cat of cats) {
    for (const name of cat.activityNames) {
      nameMap.set(name, { categoryId: cat.id, active: cat.active });
    }
  }
  return list.map((a) => {
    const mapping = nameMap.get(a.name);
    return {
      ...a,
      categoryId: mapping?.categoryId ?? "",
      active: mapping?.active ?? true,
    };
  });
}

export const activityHandlers = [
  // GET */api/export
  http.get("*/api/export", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const enriched = enrichActivities(activities);
    const activitiesMap: Record<string, ActivityRecordServer> = {};
    for (const activity of enriched) {
      const { id, active, ...rest } = activity;
      // active is stripped — not part of the stored ActivityRecordServer shape
      void active;
      activitiesMap[id] = rest;
    }

    const cats = getCategories();
    const categoriesMap: Record<string, Omit<(typeof cats)[number], "id">> = {};
    for (const category of cats) {
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
    const enriched = enrichActivities(activities);

    if (limit) {
      return HttpResponse.json(enriched.slice(0, parseInt(limit)));
    }
    return HttpResponse.json(enriched);
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
