import { delay, http, HttpResponse } from "msw";
import type {
  ActivityRecordServer,
  ActivityRecordWithIdServer,
} from "../../data/types";
import { createMockActivity, mockActivities } from "../data/activities";
import { getCategories, setCategories } from "./categories";

let activities = [...mockActivities];

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

  // POST */api/activities/rename
  http.post("*/api/activities/rename", async ({ request }) => {
    await delay(100);
    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) return new HttpResponse(null, { status: 401 });

    const { oldName, newName } = (await request.json()) as {
      oldName: string;
      newName: string;
    };
    let count = 0;
    activities = activities.map((a) => {
      if (a.name === oldName) {
        count++;
        return { ...a, name: newName };
      }
      return a;
    });

    // Also update category activityNames (immutably)
    const cats = getCategories();
    setCategories(
      cats.map((cat) => {
        const idx = cat.activityNames.indexOf(oldName);
        if (idx !== -1) {
          const newNames = [...cat.activityNames];
          newNames[idx] = newName;
          return { ...cat, activityNames: newNames };
        }
        return cat;
      })
    );

    return HttpResponse.json({ count });
  }),

  // POST */api/activities/assign-category — operates on category activityNames
  http.post("*/api/activities/assign-category", async ({ request }) => {
    await delay(100);
    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) return new HttpResponse(null, { status: 401 });

    const { activityName, categoryId } = (await request.json()) as {
      activityName: string;
      categoryId: string;
    };

    const cats = getCategories();
    // Remove from current category, add to target (immutably)
    const removed = cats.map((cat) =>
      cat.activityNames.includes(activityName)
        ? { ...cat, activityNames: cat.activityNames.filter((n) => n !== activityName) }
        : cat
    );
    setCategories(
      removed.map((cat) =>
        cat.id === categoryId
          ? { ...cat, activityNames: [...cat.activityNames, activityName] }
          : cat
      )
    );

    return HttpResponse.json({ ok: true });
  }),

  // POST */api/activities/reassign-category — moves all names between categories
  http.post("*/api/activities/reassign-category", async ({ request }) => {
    await delay(100);
    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) return new HttpResponse(null, { status: 401 });

    const { fromCategoryId, toCategoryId } = (await request.json()) as {
      fromCategoryId: string;
      toCategoryId: string;
    };

    const cats = getCategories();
    const fromCat = cats.find((c) => c.id === fromCategoryId);
    const toCat = cats.find((c) => c.id === toCategoryId);
    if (fromCat && toCat) {
      const namesToMove = fromCat.activityNames;
      setCategories(
        cats.map((cat) => {
          if (cat.id === fromCategoryId) return { ...cat, activityNames: [] };
          if (cat.id === toCategoryId) {
            return { ...cat, activityNames: [...cat.activityNames, ...namesToMove] };
          }
          return cat;
        })
      );
    }

    return HttpResponse.json({ ok: true });
  }),

  // POST */api/activities/delete-by-category — uses category activityNames
  http.post("*/api/activities/delete-by-category", async ({ request }) => {
    await delay(100);
    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) return new HttpResponse(null, { status: 401 });

    const { categoryId } = (await request.json()) as { categoryId: string };
    const cats = getCategories();
    const cat = cats.find((c) => c.id === categoryId);
    const namesToDelete = new Set(cat?.activityNames ?? []);

    const before = activities.length;
    activities = activities.filter((a) => !namesToDelete.has(a.name));
    return HttpResponse.json({ count: before - activities.length });
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
