import { delay, http, HttpResponse } from "msw";
import { getActivities, setActivities } from "./activities";
import { getCategories, setCategories } from "./categories";

export const activityBulkHandlers = [
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
    setActivities(
      getActivities().map((a) => {
        if (a.name === oldName) {
          count++;
          return { ...a, name: newName };
        }
        return a;
      })
    );

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
        ? {
            ...cat,
            activityNames: cat.activityNames.filter((n) => n !== activityName),
          }
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
            return {
              ...cat,
              activityNames: [...cat.activityNames, ...namesToMove],
            };
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

    const activities = getActivities();
    const before = activities.length;
    setActivities(activities.filter((a) => !namesToDelete.has(a.name)));
    return HttpResponse.json({ count: before - getActivities().length });
  }),
];
